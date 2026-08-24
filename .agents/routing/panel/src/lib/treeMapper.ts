import type { MindMapNode } from 'flow-mindmap'
import type { Category, Skill } from '../stores/graph'

const CAT_ID_RE = /^cat-/

function slugFromText(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'category'
}

function randomShort(length = 4): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

function generateCategoryId(text: string, usedIds: Set<string>): string {
  const slug = slugFromText(text)
  let id: string
  do {
    id = `cat-${slug}-${randomShort()}`
  } while (usedIds.has(id))
  usedIds.add(id)
  return id
}

function resolveCategoryId(
  nodeId: string,
  nodeText: string,
  existingCategories: Category[],
  idRemap: Record<string, string>,
  usedIds: Set<string>,
): string {
  const existing = existingCategories.find((c) => c.id === nodeId)
  if (existing) {
    usedIds.add(existing.id)
    return existing.id
  }
  if (CAT_ID_RE.test(nodeId)) {
    usedIds.add(nodeId)
    return nodeId
  }
  const newId = generateCategoryId(nodeText, usedIds)
  idRemap[nodeId] = newId
  return newId
}

function normalizeParentId(parentId?: string | null): string | undefined {
  if (parentId == null || parentId === '') return undefined
  return parentId
}

function buildCategoryNode(
  cat: Category,
  categories: Category[],
  skills: Skill[],
): MindMapNode {
  const childCats = categories.filter((c) => normalizeParentId(c.parentId) === cat.id)
  const childSkills = skills.filter((s) => s.categoryId === cat.id)
  return {
    id: cat.id,
    text: cat.name,
    children: [
      ...childCats.map((c) => buildCategoryNode(c, categories, skills)),
      ...childSkills.map((s) => ({
        id: s.id,
        text: s.name,
        note: s.userDescription ? { text: s.userDescription } : undefined,
        children: [] as MindMapNode[],
      })),
    ],
  }
}

/** Graph store data → flow-mindmap tree（支持 parentId 多级分类）. */
export function graphToTree(categories: Category[], skills: Skill[]): MindMapNode {
  const roots = categories.filter((c) => !normalizeParentId(c.parentId))
  return {
    id: 'root',
    text: 'Skill 路由',
    children: roots.map((cat) => buildCategoryNode(cat, categories, skills)),
  }
}

export type BuildSkillInput = {
  name: string
  categoryId: string
  userDescription?: string
}

export type TreeToGraphResult = {
  categories: Category[]
  skills: Skill[]
  idRemap: Record<string, string>
}

function isCategoryNode(
  node: MindMapNode,
  existingCategories: Category[],
  existingSkills: Skill[],
): boolean {
  if (existingCategories.some((c) => c.id === node.id)) return true
  if (CAT_ID_RE.test(node.id)) return true
  if (existingSkills.some((s) => s.id === node.id)) return false
  const kids = node.children ?? []
  if (kids.length === 0) return false
  // 有子节点：若任一子像分类/或子还有孙 → 本节点是分类；若全是 skill 叶子也可能是分类文件夹
  return true
}

function walkCategory(
  node: MindMapNode,
  parentId: string | undefined,
  existingCategories: Category[],
  existingSkills: Skill[],
  buildSkill: (input: BuildSkillInput) => Skill,
  categories: Category[],
  skills: Skill[],
  idRemap: Record<string, string>,
  usedCategoryIds: Set<string>,
) {
  const categoryId = resolveCategoryId(
    node.id,
    node.text,
    existingCategories,
    idRemap,
    usedCategoryIds,
  )
  const existingCat = existingCategories.find((c) => c.id === node.id || c.id === categoryId)
  categories.push({
    id: categoryId,
    name: node.text,
    parentId: parentId || undefined,
    ...(existingCat ? {} : {}),
  })

  for (const child of node.children ?? []) {
    if (isCategoryNode(child, existingCategories, existingSkills)) {
      walkCategory(
        child,
        categoryId,
        existingCategories,
        existingSkills,
        buildSkill,
        categories,
        skills,
        idRemap,
        usedCategoryIds,
      )
    } else {
      const existing = existingSkills.find((s) => s.id === child.id)
      if (existing) {
        skills.push({
          ...existing,
          name: child.text,
          categoryId,
          userDescription: child.note?.text ?? existing.userDescription ?? '',
        })
      } else {
        const built = buildSkill({
          name: child.text,
          categoryId,
          userDescription: child.note?.text,
        })
        built.id = child.id
        skills.push(built)
      }
    }
  }
}

/**
 * flow-mindmap tree → graph categories/skills（递归，写回 parentId）.
 */
export function treeToGraph(
  root: MindMapNode,
  existingCategories: Category[],
  existingSkills: Skill[],
  buildSkill: (input: BuildSkillInput) => Skill,
): TreeToGraphResult {
  const categories: Category[] = []
  const skills: Skill[] = []
  const idRemap: Record<string, string> = {}
  const usedCategoryIds = new Set<string>()

  for (const cn of root.children ?? []) {
    if (isCategoryNode(cn, existingCategories, existingSkills)) {
      walkCategory(
        cn,
        undefined,
        existingCategories,
        existingSkills,
        buildSkill,
        categories,
        skills,
        idRemap,
        usedCategoryIds,
      )
    } else {
      // 顶层误放 skill：挂到合成分类不安全，跳过并尽量当分类处理
      walkCategory(
        cn,
        undefined,
        existingCategories,
        existingSkills,
        buildSkill,
        categories,
        skills,
        idRemap,
        usedCategoryIds,
      )
    }
  }

  return { categories, skills, idRemap }
}
