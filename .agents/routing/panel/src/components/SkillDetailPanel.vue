<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { SkillForm } from '../composables/useSelection'
import { useGraphStore, type Category, type Skill } from '../stores/graph'
import { normalizeSkillPath } from '../lib/pathUtils'

const props = defineProps<{
  selected: Skill | null
  selectedCategory: Category | null
  form: SkillForm
  saving: boolean
  flushPending?: () => Promise<void>
}>()

const emit = defineEmits<{
  'pick-path': []
  'pick-path-panel': []
  saved: []
  deleted: []
  'reload-form': []
}>()

const store = useGraphStore()

async function prepareWrite() {
  if (props.flushPending) await props.flushPending()
}

async function saveDetail() {
  if (!props.selected) return
  if (!props.form.name.trim()) {
    ElMessage.warning('展示名不能为空')
    return
  }
  if (!props.form.path.trim()) {
    ElMessage.warning('路径不能为空')
    return
  }
  await prepareWrite()
  const idx = store.skills.findIndex((s) => s.id === props.selected!.id)
  if (idx === -1) return
  const triggers = props.form.triggers.split('\n').map((t) => t.trim()).filter(Boolean)
  store.skills[idx] = {
    ...store.skills[idx],
    name: props.form.name.trim(),
    categoryId: props.form.categoryId,
    userDescription: props.form.userDescription,
    systemDescription: props.form.systemDescription,
    path: normalizeSkillPath(props.form.path.trim()),
    triggers,
  }
  const r = await store.enqueueSave()
  if (r.ok) {
    ElMessage.success('已保存修改')
    emit('saved')
  } else {
    ElMessage.error(r.errors.join('；'))
    emit('saved')
  }
}

async function deleteSkill() {
  if (!props.selected) return
  await prepareWrite()
  const id = props.selected.id
  store.skills = store.skills.filter((s) => s.id !== id)
  const r = await store.enqueueSave()
  if (r.ok) {
    ElMessage.success('已删除 skill')
    emit('deleted')
  } else {
    ElMessage.error(r.errors.join('；'))
    emit('saved')
  }
}

async function renameCategory(v: string) {
  if (!props.selectedCategory) return
  const name = (v || '').trim()
  if (!name) return
  await prepareWrite()
  const i = store.categories.findIndex((c) => c.id === props.selectedCategory!.id)
  if (i < 0) return
  store.categories[i] = { ...store.categories[i], name }
  const r = await store.enqueueSave()
  if (r.ok) {
    ElMessage.success('已保存分类名')
    emit('saved')
  } else {
    ElMessage.error(r.errors.join('；'))
    emit('saved')
  }
}

async function deleteCategory() {
  if (!props.selectedCategory) return
  await prepareWrite()
  const id = props.selectedCategory.id
  store.categories = store.categories.filter((c) => c.id !== id)
  store.skills = store.skills.filter((s) => s.categoryId !== id)
  const r = await store.enqueueSave()
  if (r.ok) {
    ElMessage.success('已删除分类')
    emit('deleted')
  } else {
    ElMessage.error(r.errors.join('；'))
    emit('saved')
  }
}
</script>

<template>
  <aside class="detail">
    <template v-if="selected">
      <div class="detail-title">编辑 Skill</div>
      <el-form label-position="top" size="small">
        <el-form-item label="ID（只读）">
          <el-input :model-value="selected.id" disabled />
        </el-form-item>
        <el-form-item label="展示名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId" style="width: 100%">
            <el-option v-for="c in store.categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户描述">
          <el-input v-model="form.userDescription" />
        </el-form-item>
        <el-form-item label="系统描述">
          <el-input v-model="form.systemDescription" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="路径（本机具体目录）">
          <el-input v-model="form.path" placeholder="E:\...\skills\<id>">
            <template #append>
              <el-button @click="emit('pick-path')">系统选择</el-button>
            </template>
          </el-input>
          <div class="path-hint">
            「系统选择」调系统文件夹对话框（推荐）。
            <el-button link type="primary" size="small" @click="emit('pick-path-panel')">面板浏览</el-button>
          </div>
        </el-form-item>
        <el-form-item label="触发词（每行一条）">
          <el-input v-model="form.triggers" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <div class="detail-actions">
        <el-button size="small" @click="emit('reload-form')">载入当前值</el-button>
        <el-button size="small" type="primary" :loading="saving" @click="saveDetail">保存修改</el-button>
      </div>
      <el-button class="del-btn" size="small" type="danger" plain @click="deleteSkill">删除该 Skill</el-button>
    </template>

    <template v-else-if="selectedCategory">
      <div class="detail-title">编辑分类</div>
      <el-form label-position="top" size="small">
        <el-form-item label="分类 ID（只读）">
          <el-input :model-value="selectedCategory.id" disabled />
        </el-form-item>
        <el-form-item label="分类名称">
          <el-input :model-value="selectedCategory.name" @change="(v: string) => renameCategory(v)" />
        </el-form-item>
      </el-form>
      <el-button class="del-btn" size="small" type="danger" plain @click="deleteCategory">删除该分类</el-button>
    </template>

    <template v-else>
      <div class="detail-title">节点详情</div>
      <div class="detail-empty">点击左侧节点查看 / 编辑</div>
    </template>

    <div class="detail-hint">
      画布内：Tab 加子节点 · Enter 加同级 · F2/空格 改名 · Delete 删除<br />
      画布改动自动静默同步到 SKILL_ROUTING.md
    </div>
  </aside>
</template>

<style scoped>
.detail {
  width: 280px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
  overflow-y: auto;
}
.detail-title {
  font-size: 13px;
  font-weight: 500;
}
.detail-empty {
  font-size: 12px;
  color: #999;
}
.detail-actions {
  display: flex;
  gap: 8px;
}
.del-btn {
  margin-top: 4px;
}
.detail-hint {
  margin-top: auto;
  font-size: 11px;
  color: #bbb;
  line-height: 1.6;
}
.path-hint {
  margin-top: 4px;
  font-size: 11px;
  color: #b0b0b0;
  line-height: 1.5;
}
</style>
