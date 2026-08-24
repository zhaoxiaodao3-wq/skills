<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useGraphStore } from '../stores/graph'
import { useConfigStore } from '../stores/config'
import { normalizeSkillPath } from '../lib/pathUtils'

const props = defineProps<{
  modelValue: boolean
  flushPending?: () => Promise<void>
}>()
const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  saved: []
}>()

const store = useGraphStore()
const config = useConfigStore()
const searchDescription = ref('')
const pasteContent = ref('')
const candidates = ref<Array<{ name: string; path: string; description: string }>>([])
const addTarget = ref<{ name: string; path: string; description: string } | null>(null)
const addCategoryId = ref('')
const addName = ref('')

function reset() {
  searchDescription.value = ''
  pasteContent.value = ''
  candidates.value = []
  addTarget.value = null
}

async function copyPrompt() {
  const desc = searchDescription.value.trim() || '<你的需求描述>'
  const prompt = `请用 find-skills 技能搜：${desc}
返回 top 5，严格按以下 JSON 数组格式（不要其他解释）：
[
  {"name": "skill-id", "path": "../skills/skill-id", "description": "一句话描述"}
]`
  try {
    await navigator.clipboard.writeText(prompt)
    ElMessage.success('搜索指令已复制到剪贴板，去对话里粘贴发给 agent')
  } catch {
    ElMessage.warning('复制失败，请手动复制：\n\n' + prompt)
  }
}

function parseResults() {
  const raw = pasteContent.value.trim()
  if (!raw) {
    ElMessage.warning('请粘贴 find-skills 返回结果')
    return
  }
  let items: any[] = []
  try {
    const j = JSON.parse(raw)
    if (Array.isArray(j)) items = j
    else if (j && typeof j === 'object') {
      const arr = Object.values(j).find((v) => Array.isArray(v))
      if (arr) items = arr as any[]
    }
  } catch {
    items = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const parts = l.split('|').map((p) => p.trim())
        return { name: parts[0] || '', path: parts[1] || '', description: parts[2] || '' }
      })
  }
  candidates.value = items
    .slice(0, 5)
    .map((it) => ({
      name: String(it.name || '').trim(),
      path: String(it.path || '').trim(),
      description: String(it.description || it.desc || '').trim(),
    }))
    .filter((c) => c.name)
  if (candidates.value.length === 0) ElMessage.warning('未解析出有效候选，请检查格式')
  addTarget.value = null
}

function startAdd(c: { name: string; path: string; description: string }) {
  addTarget.value = c
  addName.value = c.name
  addCategoryId.value = store.categories[0]?.id || ''
}

async function confirmAdd() {
  if (!addTarget.value) return
  if (!addName.value.trim()) {
    ElMessage.warning('请填写名称')
    return
  }
  if (!addCategoryId.value) {
    ElMessage.warning('请选择分类')
    return
  }
  if (props.flushPending) await props.flushPending()
  const skill = store.buildSkill(
    {
      name: addName.value,
      categoryId: addCategoryId.value,
      userDescription: addTarget.value.description,
      path: addTarget.value.path ? normalizeSkillPath(addTarget.value.path) : undefined,
      triggers: [],
    },
    config.skillsRoot,
  )
  if (store.skills.some((s) => s.id === skill.id)) {
    ElMessage.warning(`图谱已存在 id：${skill.id}`)
    return
  }
  store.skills.push(skill)
  const r = await store.enqueueSave()
  if (r.ok) {
    ElMessage.success(`已加入 ${skill.id}`)
    candidates.value = candidates.value.filter((c) => c.name !== addName.value)
    addTarget.value = null
    emit('saved')
  } else {
    store.skills = store.skills.filter((s) => s.id !== skill.id)
    ElMessage.error(r.errors.join('；'))
  }
}

function onOpen(v: boolean) {
  emit('update:modelValue', v)
  if (v) reset()
}
</script>

<template>
  <el-dialog :model-value="modelValue" title="搜索 Skill（find-skills 桥接）" width="560px" @update:model-value="onOpen">
    <template v-if="!addTarget">
      <el-form label-position="top">
        <el-form-item label="想找什么 skill？描述你的需求">
          <el-input v-model="searchDescription" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item>
          <el-button @click="copyPrompt">复制搜索指令</el-button>
          <span class="hint-inline">去对话里粘贴发给 agent</span>
        </el-form-item>
        <el-form-item label="粘贴 find-skills 返回结果">
          <el-input v-model="pasteContent" type="textarea" :rows="5" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="parseResults">解析并展示前 5</el-button>
        </el-form-item>
      </el-form>
      <div v-if="candidates.length" class="cand-list">
        <div v-for="(c, i) in candidates" :key="i" class="cand-card">
          <div class="cand-name">{{ c.name }}</div>
          <div class="cand-path">{{ c.path || '（无 path）' }}</div>
          <div class="cand-desc">{{ c.description }}</div>
          <el-button size="small" type="primary" @click="startAdd(c)">加入画板</el-button>
        </div>
      </div>
      <div v-else class="empty-hint">粘贴结果后点「解析」</div>
    </template>
    <template v-else>
      <el-form label-position="top">
        <el-form-item label="名称">
          <el-input v-model="addName" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="addCategoryId" style="width: 100%">
            <el-option v-for="c in store.categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户描述">
          <div class="readonly">{{ addTarget.description }}</div>
        </el-form-item>
      </el-form>
      <div style="margin-top: 12px; text-align: right">
        <el-button @click="addTarget = null">取消</el-button>
        <el-button type="primary" :loading="store.saving" @click="confirmAdd">确认加入</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.hint-inline {
  margin-left: 8px;
  font-size: 11px;
  color: #999;
}
.cand-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}
.cand-card {
  padding: 10px 12px;
  border: 0.5px solid #e5e5e5;
  border-radius: 8px;
  background: #fafafa;
}
.cand-name {
  font-size: 13px;
  font-weight: 500;
}
.cand-path {
  font-size: 11px;
  color: #888;
  margin-top: 2px;
}
.cand-desc {
  font-size: 12px;
  color: #555;
  margin-top: 4px;
  margin-bottom: 6px;
}
.readonly {
  font-size: 12px;
  color: #666;
  padding: 6px 8px;
  background: #f5f5f5;
  border-radius: 4px;
}
.empty-hint {
  font-size: 12px;
  color: #999;
  padding: 12px 0;
  text-align: center;
}
</style>
