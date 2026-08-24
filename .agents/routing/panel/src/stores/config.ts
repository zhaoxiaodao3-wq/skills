import { defineStore } from 'pinia'

export type LocalConfig = {
  routingMdPath: string
  skillsRoot: string
  defaultSkillsRoot: string
  updatedAt: string
}

export const useConfigStore = defineStore('config', {
  state: () => ({
    loaded: false,
    /** 当前生效的 Skill 仓库根目录（API 从此路径读磁盘） */
    skillsRoot: '',
    /** 线上/默认仓库路径；恢复默认时写回 skillsRoot */
    defaultSkillsRoot: '',
    routingMdPath: '',
    updatedAt: '',
    suggestions: { routingMdPath: '', skillsRoot: '' } as { routingMdPath: string; skillsRoot: string },
    errors: [] as string[],
  }),
  getters: {
    hasRoutingMd: (s) => Boolean(s.routingMdPath && s.routingMdPath.trim()),
    /** 当前 skillsRoot 与 defaultSkillsRoot 不同 → 使用本地自定义仓库 */
    usingLocalSkillsRoot: (s) => {
      const def = (s.defaultSkillsRoot || '').trim()
      const cur = (s.skillsRoot || '').trim()
      if (!def) return Boolean(cur)
      return cur !== def
    },
  },
  actions: {
    async load() {
      try {
        const res = await fetch('/api/config')
        const data = await res.json()
        if (data && data.ok) {
          this.routingMdPath = data.config.routingMdPath || ''
          this.skillsRoot = data.config.skillsRoot || ''
          this.defaultSkillsRoot = data.config.defaultSkillsRoot || ''
          this.updatedAt = data.config.updatedAt || ''
          this.suggestions = data.suggestions || { routingMdPath: '', skillsRoot: '' }
          this.errors = []
          this.loaded = true
        } else {
          this.errors = (data && data.errors) || ['加载配置失败']
          this.loaded = true
        }
      } catch (e) {
        this.errors = [String(e)]
        this.loaded = true
      }
    },

    async save(partial: Partial<LocalConfig>) {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      })
      const data = await res.json()
      if (data && data.ok) {
        this.routingMdPath = data.config.routingMdPath || ''
        this.skillsRoot = data.config.skillsRoot || ''
        this.defaultSkillsRoot = data.config.defaultSkillsRoot || ''
        this.updatedAt = data.config.updatedAt || ''
        return { ok: true as const, errors: [] as string[] }
      }
      return { ok: false as const, errors: (data && data.errors) || ['保存配置失败'] }
    },

    async pickRoutingFile(): Promise<{ ok: boolean; path?: string; cancelled?: boolean; errors: string[] }> {
      const res = await fetch('/api/pick-file', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      const data = await res.json()
      if (data && data.ok && data.path) return { ok: true, path: data.path, errors: [] }
      if (data && data.cancelled) return { ok: false, cancelled: true, errors: [] }
      return { ok: false, errors: (data && data.errors) || ['选文件失败'] }
    },

    async pickSkillsRoot(): Promise<{ ok: boolean; path?: string; cancelled?: boolean; errors: string[] }> {
      const res = await fetch('/api/pick-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: this.skillsRoot || '' }),
      })
      const data = await res.json()
      if (data && data.ok && data.path) return { ok: true, path: data.path, errors: [] }
      if (data && data.cancelled) return { ok: false, cancelled: true, errors: [] }
      return { ok: false, errors: (data && data.errors) || ['选目录失败'] }
    },
  },
})
