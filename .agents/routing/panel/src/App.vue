<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { MindMapNode } from 'flow-mindmap'
import { useGraphStore } from './stores/graph'
import { useConfigStore } from './stores/config'
import { graphToTree } from './lib/treeMapper'
import { useSelection } from './composables/useSelection'
import { useGraphSync } from './composables/useGraphSync'
import { useDirPicker } from './composables/useDirPicker'
import GraphCanvas from './components/GraphCanvas.vue'
import SkillDetailPanel from './components/SkillDetailPanel.vue'
import CreateSkillDrawer from './components/CreateSkillDrawer.vue'
import FindSkillDialog from './components/FindSkillDialog.vue'
import DirPickerDialog from './components/DirPickerDialog.vue'
import EmptyRouting from './components/EmptyRouting.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'

const EMPTY_TREE: MindMapNode = { id: 'root', text: 'Skill 路由', children: [] }

const store = useGraphStore()
const config = useConfigStore()
const canvas = ref<InstanceType<typeof GraphCanvas> | null>(null)
const canvasTree = ref<MindMapNode>({ ...EMPTY_TREE })
const selection = useSelection()

function applyTreeFromStore() {
  canvasTree.value = graphToTree(store.categories, store.skills)
}

const { handleChange, refreshFromStore, flushPending } = useGraphSync(
  canvas,
  () => selection.rebindAfterSave(),
  applyTreeFromStore,
)
const dirPicker = useDirPicker()

const drawerVisible = ref(false)
const searchVisible = ref(false)
const settingsVisible = ref(false)
const canvasReady = ref(false)
const skillsRootHintShown = ref(false)
let createPathSetter: ((p: string) => void) | null = null

async function bootGraph() {
  canvasReady.value = false
  await store.load()
  if (!store.ok) return
  applyTreeFromStore()
  canvasReady.value = true
  await nextTick()
  refreshFromStore()
  if (!config.skillsRoot && !skillsRootHintShown.value) {
    skillsRootHintShown.value = true
    ElMessage.info('建议在「设置」中配置 Skill 仓库根目录，新建 skill 将默认放在该目录下')
  }
}

onMounted(async () => {
  await config.load()
  await bootGraph()
})

async function onRoutingLoaded() {
  await config.load()
  await bootGraph()
}

async function onSettingsSaved() {
  await bootGraph()
}

const refreshing = ref(false)

/** 重新读取路由文件 / skills，无需重启服务 */
async function refreshGraph() {
  if (refreshing.value) return
  refreshing.value = true
  try {
    await flushPending()
    await config.load()
    await bootGraph()
    ElMessage.success('已从磁盘重新加载路由')
  } catch (e) {
    ElMessage.error(String(e) || '刷新失败')
  } finally {
    refreshing.value = false
  }
}

function onSelect(node: Parameters<typeof selection.onSelect>[0]) {
  selection.onSelect(node)
}

async function afterSaved() {
  refreshFromStore()
  selection.rebindAfterSave()
}

async function afterDeleted() {
  selection.clearSelection()
  refreshFromStore()
}

function newCategory() {
  canvas.value?.addChild('root')
  ElMessage.success('已新增分类节点，选中后按 F2 改名')
}

function deleteSelected() {
  const id = selection.selectedNodeId.value
  if (!id || id === 'root') {
    ElMessage.warning('请先在画布选中一个节点')
    return
  }
  canvas.value?.removeNode(id)
  selection.clearSelection()
}

function renameSelected() {
  const id = selection.selectedNodeId.value
  if (!id || id === 'root') {
    ElMessage.warning('请先在画布选中一个节点')
    return
  }
  const node = findInTree(canvas.value?.getData() ?? canvasTree.value, id)
  const next = window.prompt('输入新名称', node?.text ?? '')
  if (next && next.trim()) canvas.value?.setNodeText(id, next.trim())
}

function findInTree(node: { id: string; text: string; children?: any[] } | null, id: string): any {
  if (!node) return null
  if (node.id === id) return node
  for (const c of node.children || []) {
    const f = findInTree(c, id)
    if (f) return f
  }
  return null
}

async function pickForDetail() {
  const chosen = await dirPicker.pick(selection.form.path)
  if (chosen) selection.form.path = chosen
}

async function pickForDetailPanel() {
  const chosen = await dirPicker.openPanel(selection.form.path)
  if (chosen) selection.form.path = chosen
}

async function pickForCreate(setPath: (p: string) => void) {
  createPathSetter = setPath
  const chosen = await dirPicker.pick(undefined)
  if (chosen) createPathSetter(chosen)
  createPathSetter = null
}

async function pickForCreatePanel(setPath: (p: string) => void) {
  createPathSetter = setPath
  const chosen = await dirPicker.openPanel(undefined)
  if (chosen) createPathSetter(chosen)
  createPathSetter = null
}

async function pickForSettingsPanel(setPath: (p: string) => void, seed?: string) {
  const chosen = await dirPicker.openPanel(seed)
  if (chosen) setPath(chosen)
}
</script>

<template>
  <div class="app">
    <header class="toolbar">
      <span class="title">Skill 路由图谱</span>
      <span v-if="store.ok" class="meta">{{ store.categories.length }} 分类 · {{ store.skills.length }} skill</span>
      <div class="actions">
        <button class="active" @click="settingsVisible = true">设置</button>
        <button
          class="active"
          :disabled="!config.loaded || refreshing"
          :title="refreshing ? '刷新中…' : '重新读取路由文件（改 md 后点这里，无需重启）'"
          @click="refreshGraph"
        >
          {{ refreshing ? '刷新中…' : '刷新' }}
        </button>
        <button class="active" :disabled="!store.ok" @click="newCategory">新建分类</button>
        <button class="active" :disabled="!store.ok" @click="drawerVisible = true">新建 Skill</button>
        <button class="active" :disabled="!store.ok" @click="renameSelected">重命名选中</button>
        <button class="active danger" :disabled="!store.ok" @click="deleteSelected">删除选中</button>
        <button class="active" :disabled="!store.ok" @click="searchVisible = true">搜索</button>
      </div>
    </header>

    <div class="body">
      <div class="canvas">
        <div v-if="!config.loaded || store.loading" class="hint">加载中…</div>
        <EmptyRouting v-else-if="store.needConfig || !config.hasRoutingMd" @loaded="onRoutingLoaded" />
        <div v-else-if="!store.ok" class="hint error">{{ store.errors.join('；') }}</div>
        <GraphCanvas
          v-else-if="canvasReady"
          ref="canvas"
          :data="canvasTree"
          @select="onSelect"
          @change="handleChange"
        />
      </div>

      <SkillDetailPanel
        v-if="store.ok"
        :selected="selection.selected.value"
        :selected-category="selection.selectedCategory.value"
        :form="selection.form"
        :saving="store.saving"
        :flush-pending="flushPending"
        @pick-path="pickForDetail"
        @pick-path-panel="pickForDetailPanel"
        @saved="afterSaved"
        @deleted="afterDeleted"
        @reload-form="selection.selected.value && selection.loadFormFromSkill(selection.selected.value)"
      />
    </div>

    <CreateSkillDrawer
      v-model="drawerVisible"
      :flush-pending="flushPending"
      @saved="afterSaved"
      @pick-path="pickForCreate"
      @pick-path-panel="pickForCreatePanel"
    />
    <FindSkillDialog v-model="searchVisible" :flush-pending="flushPending" @saved="afterSaved" />
    <SettingsDrawer
      v-model="settingsVisible"
      @saved="onSettingsSaved"
      @pick-skills-root-panel="pickForSettingsPanel"
    />
    <DirPickerDialog
      :visible="dirPicker.visible.value"
      :current="dirPicker.current.value"
      :parent="dirPicker.parent.value"
      :dirs="dirPicker.dirs.value"
      :loading="dirPicker.loading.value"
      :error="dirPicker.error.value"
      @update:visible="(v) => (dirPicker.visible.value = v)"
      @confirm="dirPicker.confirm()"
      @cancel="dirPicker.cancel()"
      @enter="dirPicker.enterDir"
      @up="dirPicker.goUp"
    />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 0.5px solid #e5e5e5;
}
.title {
  font-size: 14px;
  font-weight: 500;
}
.meta {
  font-size: 12px;
  color: #888;
  margin-right: auto;
}
.actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
.actions button {
  font-size: 12px;
  padding: 4px 12px;
  border: 0.5px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  color: #999;
  cursor: not-allowed;
}
.actions button.active {
  color: #0c447c;
  border-color: #378add;
  cursor: pointer;
}
.actions button.active:hover {
  background: #e6f1fb;
}
.actions button.active:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.actions button.active.danger {
  color: #c0392b;
  border-color: #e0a8a0;
}
.actions button.active.danger:hover {
  background: #fdecea;
}
.body {
  display: flex;
  flex: 1;
  min-height: 0;
}
.canvas {
  flex: 1;
  position: relative;
  border-right: 0.5px solid #e5e5e5;
  background: #fafafa;
  min-height: 0;
  height: 100%;
}
.canvas :deep(.zm-mindmap) {
  width: 100%;
  height: 100%;
  min-height: 480px;
}
.hint {
  padding: 20px;
  font-size: 13px;
  color: #888;
}
.hint.error {
  color: #c0392b;
}
</style>
