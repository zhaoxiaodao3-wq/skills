/**
 * Browser-safe path helpers for Skill routing panel.
 * Skill path 可为相对或本机绝对路径（跨机器各自指向本地 skill 仓库）。
 */

const WIN_DRIVE_RE = /^[A-Za-z]:/
const UNC_RE = /^\\\\/

export function isAbsolutePath(p: string): boolean {
  return WIN_DRIVE_RE.test(p) || UNC_RE.test(p) || p.startsWith('/')
}

/** Unify separators; keep absolute/relative as-is (no forced relativization). */
export function normalizeSkillPath(p: string): string {
  if (!p) return p
  let s = p.trim().replace(/\//g, '\\') // Windows panel: prefer backslash for abs display
  // If looks relative (starts with .), keep forward-slash style for portability
  if (s.startsWith('.')) {
    s = p.trim().replace(/\\/g, '/')
    if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
    return s
  }
  // Absolute: normalize to OS-ish backslash on Windows
  if (s.length > 1 && (s.endsWith('\\') || s.endsWith('/'))) s = s.slice(0, -1)
  return s
}

/** @deprecated Prefer normalizeSkillPath — kept for optional UI conversion. */
export function normalizePath(p: string): string {
  if (!p) return p
  let s = p.replace(/\\/g, '/')
  if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
  return s
}

/** Optional: convert abs under .../skills/ to ../skills/<id>. Not applied on save. */
export function toRelativePath(absOrRel: string): string {
  if (!absOrRel) return absOrRel
  const trimmed = absOrRel.trim()
  if (!isAbsolutePath(trimmed) && !/^[A-Za-z]:/.test(trimmed) && !trimmed.startsWith('\\\\')) {
    return normalizePath(trimmed)
  }
  const skillsMatch = trimmed.match(/[/\\]skills[/\\](.*)$/i)
  if (skillsMatch) {
    const suffix = skillsMatch[1].replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
    return suffix ? `../skills/${suffix}` : '../skills'
  }
  return normalizePath(trimmed)
}

export function toAbsolutePath(rel: string, skillsRootAbs?: string): string {
  if (!rel) return rel
  const trimmed = rel.trim()
  const skillsRelMatch = trimmed.match(/^\.\.\/skills\/(.*)$/i)
  if (skillsRelMatch && skillsRootAbs) {
    const suffix = skillsRelMatch[1].replace(/^\/+|\/+$/g, '')
    const sep = skillsRootAbs.includes('\\') ? '\\' : '/'
    const root = skillsRootAbs.replace(/[/\\]+$/, '')
    if (!suffix) return root
    return `${root}${sep}${suffix.replace(/\//g, sep)}`
  }
  if (isAbsolutePath(trimmed) || WIN_DRIVE_RE.test(trimmed) || UNC_RE.test(trimmed)) {
    return trimmed
  }
  return trimmed
}
