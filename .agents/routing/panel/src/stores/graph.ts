import { defineStore } from 'pinia'
import { normalizeSkillPath } from '../lib/pathUtils'

export interface Category {
  id: string
  name: string
  /** 可选；空/省略=顶层 */
  parentId?: string | null
}

export interface Skill {
  id: string
  categoryId: string
  name: string
  userDescription?: string
  systemDescription?: string
  path: string
  triggers: string[]
  semanticTags?: string[]
  requires?: string[]
  before?: string[]
  after?: string[]
  version?: string
  riskLevel?: string
  isIdempotent?: boolean
  timeout?: number
  retryable?: boolean
  inputSchema?: object
  outputSchema?: object
  status?: string
  replacedBy?: string | null
  applicableConditions?: string[]
  unsuitableConditions?: string[]
}

let saving = false
let queued = false
let savePromise: Promise<{ ok: boolean; errors: string[] }> | null = null

export const useGraphStore = defineStore('graph', {
  state: () => ({
    loading: false,
    saving: false,
    ok: false,
    needConfig: false,
    errors: [] as string[],
    version: 1,
    updatedAt: '',
    globalConfig: { maxSkillsPerPlan: 5, minConfidence: 0.7, autoActivateRiskLevel: 'low' },
    categories: [] as Category[],
    skills: [] as Skill[],
  }),
  actions: {
    async load() {
      this.loading = true
      try {
        const res = await fetch('/api/graph')
        const data = await res.json()
        if (data && data.ok) {
          this.ok = true
          this.needConfig = false
          this.version = data.graph.version ?? 1
          this.updatedAt = data.graph.updatedAt ?? ''
          this.globalConfig = data.graph.globalConfig ?? this.globalConfig
          this.categories = data.graph.categories || []
          this.skills = (data.graph.skills || []).map((s: Skill) => ({
            ...s,
            path: normalizeSkillPath(s.path || ''),
          }))
          this.errors = []
        } else {
          this.ok = false
          this.needConfig = Boolean(data && data.needConfig)
          this.errors = (data && data.errors) || ['加载失败']
          this.categories = []
          this.skills = []
        }
      } catch (e) {
        this.ok = false
        this.needConfig = true
        this.errors = [String(e)]
      } finally {
        this.loading = false
      }
    },

    buildSkill(input: any, skillsRoot?: string): Skill {
      const name = (input.name || '').trim()
      const id = name.toLowerCase().replace(/\s+/g, '-')
      let path = input.path
      if (!path || !String(path).trim()) {
        const root = (skillsRoot || '').trim()
        path = root ? `${root.replace(/[/\\]+$/, '')}\\${id}` : `../skills/${id}`
      }
      return {
        id,
        categoryId: input.categoryId,
        name,
        userDescription: input.userDescription || '',
        systemDescription: input.systemDescription || '',
        path: normalizeSkillPath(path),
        triggers: input.triggers || [],
        semanticTags: [],
        requires: [],
        before: [],
        after: [],
        version: '1.0.0',
        riskLevel: 'low',
        isIdempotent: true,
        timeout: 300,
        retryable: true,
        inputSchema: {},
        outputSchema: {},
        status: 'active',
        replacedBy: null,
        applicableConditions: [],
        unsuitableConditions: [],
      }
    },

    async runSave(): Promise<{ ok: boolean; errors: string[] }> {
      const snapshot = JSON.parse(
        JSON.stringify({
          categories: this.categories,
          skills: this.skills,
          version: this.version,
          updatedAt: this.updatedAt,
          globalConfig: this.globalConfig,
        }),
      )

      this.skills = this.skills.map((s) => ({
        ...s,
        path: normalizeSkillPath(s.path || ''),
      }))

      try {
        const graph = {
          version: this.version,
          updatedAt: new Date().toISOString().slice(0, 10),
          globalConfig: this.globalConfig,
          categories: this.categories,
          skills: this.skills,
        }
        const res = await fetch('/api/graph', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(graph),
        })
        const data = await res.json()
        if (data && data.ok) return { ok: true, errors: [] }

        this.categories = snapshot.categories
        this.skills = snapshot.skills
        this.version = snapshot.version
        this.updatedAt = snapshot.updatedAt
        this.globalConfig = snapshot.globalConfig
        return { ok: false, errors: (data && data.errors) || ['保存失败'] }
      } catch (e) {
        this.categories = snapshot.categories
        this.skills = snapshot.skills
        this.version = snapshot.version
        this.updatedAt = snapshot.updatedAt
        this.globalConfig = snapshot.globalConfig
        return { ok: false, errors: [String(e)] }
      }
    },

    async enqueueSave(): Promise<{ ok: boolean; errors: string[] }> {
      if (saving) {
        queued = true
        return savePromise!
      }

      saving = true
      this.saving = true
      savePromise = (async () => {
        try {
          let result = await this.runSave()
          while (queued) {
            queued = false
            result = await this.runSave()
          }
          return result
        } finally {
          saving = false
          this.saving = false
          savePromise = null
        }
      })()

      return savePromise
    },

    async saveAll(): Promise<{ ok: boolean; errors: string[] }> {
      return this.enqueueSave()
    },
  },
})
