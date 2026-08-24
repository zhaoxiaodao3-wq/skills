import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { normalizeSkillPath } from '../lib/pathUtils'

export function useDirPicker() {
  const visible = ref(false)
  const current = ref('')
  const parent = ref('')
  const dirs = ref<string[]>([])
  const loading = ref(false)
  const error = ref('')
  let resolvePick: ((path: string | null) => void) | null = null

  async function loadDir(p: string) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch('/api/list-dir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: p }),
      })
      const data = await res.json()
      if (data && data.ok) {
        current.value = data.path
        parent.value = data.parent
        dirs.value = data.dirs || []
      } else {
        error.value = (data && data.errors && data.errors.join('；')) || '加载失败'
      }
    } catch (e) {
      error.value = String(e)
    } finally {
      loading.value = false
    }
  }

  /** 面板内浏览（服务端目录列表）。 */
  function openPanel(seedPath?: string): Promise<string | null> {
    visible.value = true
    loadDir((seedPath || '').trim())
    return new Promise((resolve) => {
      resolvePick = resolve
    })
  }

  /**
   * 优先系统文件夹对话框（本机 dev / Windows 上 Node 调 PowerShell）。
   * 失败时落到面板浏览。
   */
  async function pick(seedPath?: string): Promise<string | null> {
    try {
      const res = await fetch('/api/pick-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: (seedPath || '').trim() }),
      })
      const data = await res.json()
      if (data && data.ok && data.path) {
        return normalizeSkillPath(data.path)
      }
      if (data && data.cancelled) {
        return null
      }
      if (data && data.errors && data.errors.length) {
        ElMessage.warning(data.errors.join('；') + ' — 已切换面板浏览')
      }
    } catch (e) {
      ElMessage.warning(String(e) + ' — 已切换面板浏览')
    }
    return openPanel(seedPath)
  }

  function enterDir(name: string) {
    const sep = current.value.includes('/') && !current.value.includes('\\') ? '/' : '\\'
    loadDir(`${current.value}${sep}${name}`)
  }

  function goUp() {
    if (parent.value) loadDir(parent.value)
  }

  function confirm() {
    if (!current.value) return
    const chosen = normalizeSkillPath(current.value)
    visible.value = false
    resolvePick?.(chosen)
    resolvePick = null
  }

  function cancel() {
    visible.value = false
    resolvePick?.(null)
    resolvePick = null
  }

  return {
    visible,
    current,
    parent,
    dirs,
    loading,
    error,
    pick,
    openPanel,
    enterDir,
    goUp,
    confirm,
    cancel,
    loadDir,
  }
}
