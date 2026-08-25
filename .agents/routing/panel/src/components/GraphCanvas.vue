<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { MindMap } from 'flow-mindmap'
import type { MindMapNode } from 'flow-mindmap'

const props = defineProps<{
  data: MindMapNode
}>()

const mm = ref<InstanceType<typeof MindMap> | null>(null)
const host = ref<HTMLElement | null>(null)
/** Suppress change while applying host data → canvas. */
const hydrating = ref(false)
const spaceHeld = ref(false)
let synthesizingPan = false

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

function resetView() {
  mm.value?.resetView?.()
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest('input, textarea, [contenteditable="true"]'))
}

function isNodeOrChrome(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest('.zm-node, .zm-toolbar, button, input, textarea'))
}

/**
 * flow-mindmap 默认只有「右键拖」平移；空白左键是框选。
 * 这里把空白左键 / 中键 / 空格+左键 转成右键拖，方便拖拽视图。
 * Shift+空白左键仍走原框选。
 */
function dispatchPanMousedown(source: MouseEvent) {
  const canvas = host.value?.querySelector('.zm-canvas')
  if (!canvas) return
  synthesizingPan = true
  canvas.dispatchEvent(
    new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: source.clientX,
      clientY: source.clientY,
      screenX: source.screenX,
      screenY: source.screenY,
      button: 2,
      buttons: 2,
      ctrlKey: source.ctrlKey,
      altKey: source.altKey,
      metaKey: source.metaKey,
      shiftKey: false,
    }),
  )
  synthesizingPan = false
}

function onMousedownCapture(e: MouseEvent) {
  if (synthesizingPan) return
  if (isEditableTarget(e.target)) return

  const middle = e.button === 1
  const spaceLeft = e.button === 0 && spaceHeld.value
  const blankLeftPan = e.button === 0 && !e.shiftKey && !isNodeOrChrome(e.target)

  if (!middle && !spaceLeft && !blankLeftPan) return

  e.preventDefault()
  e.stopPropagation()
  dispatchPanMousedown(e)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.code !== 'Space' || e.repeat) return
  if (isEditableTarget(e.target)) return
  e.preventDefault()
  spaceHeld.value = true
}

function onKeyUp(e: KeyboardEvent) {
  if (e.code === 'Space') spaceHeld.value = false
}

function onBlur() {
  spaceHeld.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown, true)
  window.addEventListener('keyup', onKeyUp, true)
  window.addEventListener('blur', onBlur)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown, true)
  window.removeEventListener('keyup', onKeyUp, true)
  window.removeEventListener('blur', onBlur)
})

defineExpose({ refresh, getData, addChild, removeNode, setNodeText, resetView })
</script>

<template>
  <div
    ref="host"
    class="graph-canvas-host"
    :class="{ 'is-space-pan': spaceHeld }"
    @mousedown.capture="onMousedownCapture"
  >
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
    <div class="pan-hint">
      拖视图：空白处拖拽 / 中键拖 / 空格+拖 · 滚轮缩放 · Shift+空白框选
    </div>
  </div>
</template>

<style scoped>
.graph-canvas-host {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  min-height: 480px;
}
.graph-canvas-host.is-space-pan,
.graph-canvas-host.is-space-pan :deep(.zm-canvas) {
  cursor: grab;
}
.graph-canvas-host.is-space-pan:active,
.graph-canvas-host.is-space-pan:active :deep(.zm-canvas) {
  cursor: grabbing;
}
.mindmap {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 480px;
}
.pan-hint {
  position: absolute;
  left: 12px;
  bottom: 10px;
  z-index: 2;
  pointer-events: none;
  font-size: 11px;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.85);
  border: 0.5px solid #e2e8f0;
  border-radius: 6px;
  padding: 3px 8px;
}
</style>
