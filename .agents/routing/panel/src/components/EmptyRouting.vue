<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useConfigStore } from '../stores/config'

const emit = defineEmits<{ loaded: [] }>()
const config = useConfigStore()
const busy = ref(false)

async function chooseFile() {
  busy.value = true
  try {
    const picked = await config.pickRoutingFile()
    if (picked.cancelled) return
    if (!picked.ok || !picked.path) {
      ElMessage.error(picked.errors.join('；') || '未选择文件')
      return
    }
    const r = await config.save({ routingMdPath: picked.path })
    if (!r.ok) {
      ElMessage.error(r.errors.join('；'))
      return
    }
    ElMessage.success('已加载路由文件')
    emit('loaded')
  } finally {
    busy.value = false
  }
}

async function useSuggested() {
  const p = config.suggestions.routingMdPath
  if (!p) {
    ElMessage.warning('未检测到默认 SKILL_ROUTING.md')
    return
  }
  busy.value = true
  try {
    const patch: { routingMdPath: string; skillsRoot?: string } = { routingMdPath: p }
    if (!config.skillsRoot && config.suggestions.skillsRoot) {
      patch.skillsRoot = config.suggestions.skillsRoot
    }
    const r = await config.save(patch)
    if (!r.ok) {
      ElMessage.error(r.errors.join('；'))
      return
    }
    ElMessage.success('已采用本机默认路由文件')
    emit('loaded')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="empty">
    <div class="title">尚未加载 Skill 路由文件</div>
    <div class="desc">
      请选择本机的 <code>SKILL_ROUTING.md</code>（需含机器块标记）。不同电脑可指向不同路径。
    </div>
    <div class="actions">
      <el-button type="primary" :loading="busy" @click="chooseFile">系统选择 MD 文件</el-button>
      <el-button
        v-if="config.suggestions.routingMdPath"
        :loading="busy"
        @click="useSuggested"
      >
        使用检测到的默认文件
      </el-button>
    </div>
    <div v-if="config.suggestions.routingMdPath" class="hint">
      检测到：{{ config.suggestions.routingMdPath }}
    </div>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 48px 40px;
  max-width: 560px;
}
.title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}
.desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
}
.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.hint {
  font-size: 11px;
  color: #94a3b8;
  word-break: break-all;
}
code {
  font-size: 12px;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
}
</style>
