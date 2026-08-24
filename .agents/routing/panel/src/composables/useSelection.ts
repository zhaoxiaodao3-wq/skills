import { reactive, ref } from 'vue'
import type { MindMapNode } from 'flow-mindmap'
import { useGraphStore, type Category, type Skill } from '../stores/graph'
import { normalizeSkillPath } from '../lib/pathUtils'

export type SkillForm = {
  name: string
  categoryId: string
  userDescription: string
  systemDescription: string
  path: string
  triggers: string
}

export function useSelection() {
  const store = useGraphStore()
  const selectedNodeId = ref<string | null>(null)
  const selected = ref<Skill | null>(null)
  const selectedCategory = ref<Category | null>(null)
  const form = reactive<SkillForm>({
    name: '',
    categoryId: '',
    userDescription: '',
    systemDescription: '',
    path: '',
    triggers: '',
  })

  function loadFormFromSkill(s: Skill) {
    form.name = s.name
    form.categoryId = s.categoryId
    form.userDescription = s.userDescription || ''
    form.systemDescription = s.systemDescription || ''
    form.path = s.path
    form.triggers = (s.triggers || []).join('\n')
  }

  function clearSelection() {
    selectedNodeId.value = null
    selected.value = null
    selectedCategory.value = null
  }

  /** Normalize flow-mindmap select payload (array | node | null). */
  function onSelect(event: MindMapNode[] | MindMapNode | null) {
    const node = Array.isArray(event) ? (event[0] ?? null) : (event ?? null)
    selectedNodeId.value = node?.id ?? null
    if (!node || node.id === 'root') {
      selected.value = null
      selectedCategory.value = null
      return
    }
    const skill = store.skills.find((s) => s.id === node.id) || null
    selected.value = skill
    selectedCategory.value = skill ? null : store.categories.find((c) => c.id === node.id) || null
    if (skill) loadFormFromSkill(skill)
  }

  function rebindAfterSave() {
    const id = selectedNodeId.value
    if (!id || id === 'root') {
      selected.value = null
      selectedCategory.value = null
      return
    }
    const skill = store.skills.find((s) => s.id === id) || null
    if (skill) {
      selected.value = skill
      selectedCategory.value = null
      loadFormFromSkill(skill)
      return
    }
    const cat = store.categories.find((c) => c.id === id) || null
    if (cat) {
      selected.value = null
      selectedCategory.value = cat
      return
    }
    clearSelection()
  }

  function applyFormToStore(): boolean {
    if (!selected.value) return false
    if (!form.name.trim() || !form.path.trim()) return false
    const idx = store.skills.findIndex((s) => s.id === selected.value!.id)
    if (idx === -1) return false
    const triggers = form.triggers.split('\n').map((t) => t.trim()).filter(Boolean)
    store.skills[idx] = {
      ...store.skills[idx],
      name: form.name.trim(),
      categoryId: form.categoryId,
      userDescription: form.userDescription,
      systemDescription: form.systemDescription,
      path: normalizeSkillPath(form.path.trim()),
      triggers,
    }
    selected.value = store.skills[idx]
    return true
  }

  return {
    selectedNodeId,
    selected,
    selectedCategory,
    form,
    onSelect,
    loadFormFromSkill,
    rebindAfterSave,
    applyFormToStore,
    clearSelection,
  }
}
