<script setup lang="ts">
defineProps<{
  visible: boolean
  current: string
  parent: string
  dirs: string[]
  loading: boolean
  error: string
}>()

const emit = defineEmits<{
  'update:visible': [v: boolean]
  confirm: []
  cancel: []
  enter: [name: string]
  up: []
}>()
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="选择 skill 所在文件夹"
    width="560px"
    append-to-body
    :z-index="10000"
    destroy-on-close
    @update:model-value="(v: boolean) => (!v ? emit('cancel') : emit('update:visible', v))"
  >
    <div class="dir-head">
      <span class="dir-path">{{ current || '（默认：skills 目录）' }}</span>
      <el-button size="small" :disabled="!parent" @click="emit('up')">上一级</el-button>
    </div>
    <div v-if="loading" class="dir-tip">加载中…</div>
    <div v-else-if="error" class="dir-tip error">{{ error }}</div>
    <div v-else class="dir-list">
      <div v-if="dirs.length === 0" class="dir-tip">（此文件夹下没有子文件夹，可直接「选择此文件夹」）</div>
      <div v-for="d in dirs" :key="d" class="dir-row" @click="emit('enter', d)">
        <span class="dir-icon">📁</span>
        <span class="dir-name">{{ d }}</span>
      </div>
    </div>
    <template #footer>
      <el-button @click="emit('cancel')">取消</el-button>
      <el-button type="primary" :disabled="!current" @click="emit('confirm')">选择此文件夹</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.dir-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.dir-path {
  font-size: 12px;
  color: #555;
  word-break: break-all;
  line-height: 1.5;
}
.dir-tip {
  font-size: 12px;
  color: #999;
  padding: 14px 0;
  text-align: center;
}
.dir-tip.error {
  color: #c0392b;
}
.dir-list {
  max-height: 300px;
  overflow-y: auto;
  border: 0.5px solid #e5e5e5;
  border-radius: 8px;
}
.dir-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 0.5px solid #f0f0f0;
}
.dir-row:hover {
  background: #e6f1fb;
}
.dir-row:last-child {
  border-bottom: none;
}
.dir-icon {
  font-size: 13px;
}
.dir-name {
  color: #333;
}
</style>
