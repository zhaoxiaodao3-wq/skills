import type { Ref } from 'vue'
import type { MindMapNode } from 'flow-mindmap'
import { ElMessage } from 'element-plus'
import { useGraphStore } from '../stores/graph'
import { useConfigStore } from '../stores/config'
import { graphToTree, treeToGraph } from '../lib/treeMapper'

export type CanvasExpose = {
  refresh: (tree: MindMapNode) => void | Promise<void>
  getData: () => MindMapNode | null
}

export function useGraphSync(
  canvasRef: Ref<CanvasExpose | null | undefined>,
  rebindAfterSave: () => void,
  applyTreeFromStore?: () => void,
) {
  const store = useGraphStore()
  const config = useConfigStore()
  let syncTimer: ReturnType<typeof setTimeout> | null = null
  let pendingRoot: MindMapNode | null = null

  function refreshFromStore() {
    applyTreeFromStore?.()
    const tree = graphToTree(store.categories, store.skills)
    void canvasRef.value?.refresh(tree)
  }

  async function doSync() {
    syncTimer = null
    const root = pendingRoot
    pendingRoot = null
    if (!root) return

    const { categories, skills, idRemap } = treeToGraph(
      root,
      store.categories,
      store.skills,
      (input) => store.buildSkill(input, config.skillsRoot),
    )
    store.categories = categories
    store.skills = skills

    const r = await store.enqueueSave()
    if (!r.ok) {
      ElMessage.error(r.errors.join('；'))
      refreshFromStore()
      rebindAfterSave()
      return
    }

    if (Object.keys(idRemap).length > 0) {
      refreshFromStore()
    } else {
      applyTreeFromStore?.()
    }
    rebindAfterSave()
  }

  function handleChange(root: MindMapNode) {
    const cats = root?.children?.length ?? 0
    if (cats === 0 && (store.categories.length > 0 || store.skills.length > 0)) {
      return
    }
    pendingRoot = root
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(doSync, 800)
  }

  function cancelPending() {
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = null
    pendingRoot = null
  }

  async function flushPending() {
    if (!pendingRoot && !syncTimer) return
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = null
    await doSync()
  }

  return { handleChange, refreshFromStore, doSync, cancelPending, flushPending }
}
