<script setup lang="ts">
import { reactive, watch } from 'vue'
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
  'pick-path': [setPath: (p: string) => void]
  'pick-path-panel': [setPath: (p: string) => void]
}>()

const store = useGraphStore()
const config = useConfigStore()
const createForm = reactive({
  name: '',
  categoryId: '',
  userDescription: '',
  systemDescription: '',
  path: '',
  triggers: '',
})

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return
    createForm.name = ''
    createForm.categoryId = store.categories[0]?.id || ''
    createForm.userDescription = ''
    createForm.systemDescription = ''
    createForm.path = ''
    createForm.triggers = ''
  },
)

function setPath(p: string) {
  createForm.path = p
}

function requestPick() {
  emit('pick-path', setPath)
}

function requestPickPanel() {
  emit('pick-path-panel', setPath)
}

async function submit() {
  if (!createForm.name.trim()) {
    ElMessage.warning('请填写 skill id')
    return
  }
  if (!createForm.categoryId) {
    ElMessage.warning('请选择分类')
    return
  }
  if (props.flushPending) await props.flushPending()
  const idName = createForm.name.trim().toLowerCase().replace(/\s+/g, '-')
  const triggers = createForm.triggers.split('\n').map((t) => t.trim()).filter(Boolean)
  const skill = store.buildSkill(
    {
      name: idName,
      categoryId: createForm.categoryId,
      userDescription: createForm.userDescription,
      systemDescription: createForm.systemDescription,
      path: createForm.path ? normalizeSkillPath(createForm.path) : undefined,
      triggers,
    },
    config.skillsRoot,
  )
  if (!createForm.path.trim() && !config.skillsRoot) {
    ElMessage.warning('未设置 Skill 仓库，已使用相对默认路径；可在「设置」中配置仓库根目录')
  }
  if (store.skills.some((s) => s.id === skill.id)) {
    ElMessage.warning(`已存在 id：${skill.id}`)
    return
  }
  store.skills.push(skill)
  const r = await store.enqueueSave()
  if (r.ok) {
    ElMessage.success('已保存到 SKILL_ROUTING.md')
    emit('update:modelValue', false)
    emit('saved')
  } else {
    store.skills = store.skills.filter((s) => s.id !== skill.id)
    ElMessage.error(r.errors.join('；'))
  }
}
</script>

<template>
  <el-drawer :model-value="modelValue" title="新建 Skill" size="380px" @update:model-value="emit('update:modelValue', $event)">
    <el-form label-position="top">
      <el-form-item label="Skill ID（创建后不可改）" required>
        <el-input v-model="createForm.name" placeholder="例如 my-skill" />
      </el-form-item>
      <el-form-item label="分类" required>
        <el-select v-model="createForm.categoryId" placeholder="选择分类" style="width: 100%">
          <el-option v-for="c in store.categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="用户描述">
        <el-input v-model="createForm.userDescription" placeholder="一句话：这个 skill 用来干嘛" />
      </el-form-item>
      <el-form-item label="系统描述">
        <el-input v-model="createForm.systemDescription" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="路径（本机具体目录）">
        <el-input v-model="createForm.path" placeholder="E:\...\skills\my-skill">
          <template #append>
            <el-button @click="requestPick">系统选择</el-button>
          </template>
        </el-input>
        <div class="path-hint">
          「系统选择」调系统文件夹对话框。
          <el-button link type="primary" size="small" @click="requestPickPanel">面板浏览</el-button>
        </div>
      </el-form-item>
      <el-form-item label="触发词（每行一条）">
        <el-input v-model="createForm.triggers" type="textarea" :rows="4" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="store.saving" @click="submit">保存</el-button>
    </template>
  </el-drawer>
</template>

<style scoped>
.path-hint {
  margin-top: 4px;
  font-size: 11px;
  color: #b0b0b0;
  line-height: 1.5;
}
</style>
