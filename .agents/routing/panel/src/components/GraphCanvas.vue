<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { MindMap } from 'flow-mindmap'
import type { MindMapNode } from 'flow-mindmap'

const props = defineProps<{
  data: MindMapNode
}>()

const mm = ref<InstanceType<typeof MindMap> | null>(null)
/** Suppress change while applying host data → canvas. */
const hydrating = ref(false)

const emit = defineEmits<{
  select: [node: MindMapNode | null]
  change: [root: MindMapNode]
}>()

function onSelect(event: MindMapNode[] | MindMapNode | null) {
  const node = Array.isArray(event) ? (event[0] ?? null) : (event ?? null)
  emit('select', node)
}

function onChange(root: MindMapNode) {
  if (hydrating.value) return
  emit('change', root)
}

async function applyData(tree: MindMapNode) {
  hydrating.value = true
  try {
    // Wait until MindMap component instance exists
    for (let i = 0; i < 20 && !mm.value; i++) {
      await nextTick()
    }
    if (mm.value?.setData) {
      mm.value.setData(tree)
    }
    await nextTick()
  } finally {
    await nextTick()
    hydrating.value = false
  }
}

watch(
  () => props.data,
  (tree) => {
    if (!tree?.id) return
    void applyData(tree)
  },
  { immediate: true, deep: false },
)

function refresh(tree: MindMapNode) {
  return applyData(tree)
}

function getData(): MindMapNode | null {
  return mm.value?.getData?.() ?? null
}

function addChild(parentId: string) {
  mm.value?.addChild(parentId)
}

function removeNode(id: string) {
  mm.value?.removeNode(id)
}

function setNodeText(id: string, text: string) {
  mm.value?.setNodeText(id, text)
}

defineExpose({ refresh, getData, addChild, removeNode, setNodeText })
</script>

<template>
  <MindMap
    ref="mm"
    :data="data"
    :theme="{ rainbowBranch: true, fontSize: 14 }"
    :line-colors="['#378add', '#1d9e75', '#d4537e', '#ba7517']"
    :built-in-drawers="false"
    class="mindmap"
    @select="onSelect"
    @change="onChange"
  />
</template>

<style scoped>
.mindmap {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 480px;
}
</style>
