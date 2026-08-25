<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useConfigStore } from '../stores/config'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  saved: []
  'pick-skills-root-panel': [setPath: (p: string) => void, seed?: string]
}>()

const config = useConfigStore()
const routingMdPath = ref('')
const useLocal = ref(false)
const localSkillsRoot = ref('')
const saving = ref(false)

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return
    routingMdPath.value = config.routingMdPath
    useLocal.value = config.usingLocalSkillsRoot
    localSkillsRoot.value = useLocal.value ? config.skillsRoot : ''
  },
)

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const defaultSkillsRootDisplay = computed(() => {
  const s = (config.defaultSkillsRoot || '').trim()
  return s || '未配置'
})

function setLocalPath(p: string) {
  localSkillsRoot.value = p
}

function pickSeed() {
  return localSkillsRoot.value.trim() || config.skillsRoot || undefined
}

function pickPanel() {
  emit('pick-skills-root-panel', setLocalPath, pickSeed())
}

async function pickSystem() {
  const r = await config.pickSkillsRoot()
  if (r.cancelled) return
  if (!r.ok || !r.path) {
    if (r.errors?.length) ElMessage.error(r.errors.join('；'))
    return
  }
  localSkillsRoot.value = r.path
}

function restoreDefault() {
  useLocal.value = false
  localSkillsRoot.value = ''
  ElMessage.success('将恢复为默认仓库路径（保存后生效）')
}

async function pickMd() {
  const r = await config.pickRoutingFile()
  if (r.cancelled) return
  if (!r.ok || !r.path) {
    ElMessage.error(r.errors.join('；') || '未选择')
    return
  }
  routingMdPath.value = r.path
}

async function save() {
  saving.value = true
  try {
    const patch: {
      routingMdPath: string
      skillsRoot: string
    } = {
      routingMdPath: routingMdPath.value.trim(),
      skillsRoot: '',
    }

    if (useLocal.value) {
      const path = localSkillsRoot.value.trim()
      if (!path) {
        ElMessage.error('请填写本地 Skill 仓库路径')
        return
      }
      patch.skillsRoot = path
    } else {
      patch.skillsRoot = (config.defaultSkillsRoot || '').trim()
      if (!patch.skillsRoot) {
        ElMessage.error('未配置默认仓库路径，请手填本地路径或联系管理员')
        return
      }
    }

    const r = await config.save(patch)
    if (!r.ok) {
      ElMessage.error(r.errors.join('；'))
      return
    }
    ElMessage.success('配置已保存，画板将从该路径读取 Skill 仓库')
    open.value = false
    emit('saved')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <el-drawer v-model="open" title="Skill 配置" size="420px" append-to-body :z-index="5000">
    <el-form label-position="top">
      <el-form-item label="路由文件（SKILL_ROUTING.md）">
        <el-input v-model="routingMdPath" type="textarea" :rows="2" placeholder="绝对路径" />
        <el-button class="mt" @click="pickMd">系统选择文件…</el-button>
      </el-form-item>

      <el-divider />

      <el-form-item label="默认 Skill 仓库（线上）">
        <div class="readonly-path">{{ defaultSkillsRootDisplay }}</div>
      </el-form-item>

      <el-form-item>
        <div class="switch-row">
          <span>改用本地 Skill 仓库</span>
          <el-switch v-model="useLocal" />
        </div>
      </el-form-item>

      <el-form-item v-if="useLocal" label="本地仓库路径">
        <el-input
          v-model="localSkillsRoot"
          type="textarea"
          :rows="2"
          placeholder="本机绝对路径，如 E:\code\frontend-local\.agents\skills"
        />
        <div class="btn-row mt">
          <el-button @click="pickSystem">系统选择目录…</el-button>
          <el-button @click="pickPanel">面板浏览</el-button>
          <el-button @click="restoreDefault">恢复默认仓库</el-button>
        </div>
      </el-form-item>

      <div class="hint">
        画板由<strong>运行本服务的机器</strong>按 <code>skillsRoot</code> 读磁盘，不上传文件。默认读线上仓库；改本地路径后，列表/新建
        skill 都走本地目录。本机开发请用 <code>npm run dev</code>，系统选目录才会打开 Windows 文件夹对话框。
      </div>
    </el-form>
    <template #footer>
      <el-button @click="open = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="save">保存</el-button>
    </template>
  </el-drawer>
</template>

<style scoped>
.mt {
  margin-top: 8px;
}
.btn-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 14px;
}
.readonly-path {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  word-break: break-all;
}
.hint {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.6;
}
code {
  font-size: 11px;
  background: #f1f5f9;
  padding: 1px 4px;
  border-radius: 3px;
}
</style>
