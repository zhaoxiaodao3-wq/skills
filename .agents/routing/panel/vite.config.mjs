import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { readdirSync, statSync } from 'node:fs'
import { spawn } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROUTING_DIR = path.join(__dirname, '..')
const routerUrl = pathToFileURL(path.join(ROUTING_DIR, 'router.mjs')).href
const FALLBACK_SKILLS = path.join(ROUTING_DIR, '..', 'skills')
const PICK_FOLDER = path.join(__dirname, 'scripts', 'pick-folder.ps1')
const PICK_FILE = path.join(__dirname, 'scripts', 'pick-file.ps1')

async function readJsonBody(req) {
  let body = ''
  for await (const chunk of req) body += chunk
  try {
    return JSON.parse(body || '{}')
  } catch {
    return {}
  }
}

function spawnPs(script, extraArgs = []) {
  return new Promise((resolve) => {
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-STA', '-ExecutionPolicy', 'Bypass', '-File', script, ...extraArgs],
      { windowsHide: false, stdio: ['ignore', 'pipe', 'pipe'] },
    )
    let out = ''
    let err = ''
    const timer = setTimeout(() => {
      try {
        child.kill()
      } catch {
        /* ignore */
      }
      resolve({ ok: false, errors: ['系统对话框超时'] })
    }, 120000)
    child.stdout.on('data', (d) => {
      out += String(d)
    })
    child.stderr.on('data', (d) => {
      err += String(d)
    })
    child.on('error', (e) => {
      clearTimeout(timer)
      resolve({ ok: false, errors: [String(e)] })
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      const selected = out.trim()
      if (code === 0 && selected) resolve({ ok: true, path: selected, cancelled: false })
      else if (code === 2) resolve({ ok: false, cancelled: true, errors: [] })
      else resolve({ ok: false, cancelled: false, errors: [err.trim() || `对话框失败 code=${code}`] })
    })
  })
}

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'skill-routing-api',
      configureServer(server) {
        let routerMod
        async function getRouter() {
          // bust cache so router.mjs edits apply after restart only; keep single import per process
          if (!routerMod) routerMod = await import(routerUrl + '?t=' + Date.now())
          return routerMod
        }

        function skillsRootOrFallback(cfg) {
          const root = (cfg && cfg.skillsRoot) || ''
          if (root) {
            try {
              if (statSync(root).isDirectory()) return root
            } catch {
              /* fall through */
            }
          }
          return FALLBACK_SKILLS
        }

        function resolveListTarget(p, cfg) {
          const base = skillsRootOrFallback(cfg)
          if (!p || typeof p !== 'string' || !p.trim()) return base
          const raw = p.trim()
          let target = path.isAbsolute(raw) ? path.resolve(raw) : path.resolve(ROUTING_DIR, raw)
          try {
            if (statSync(target).isDirectory()) return target
          } catch {
            /* ENOENT */
          }
          let cur = target
          for (let i = 0; i < 8; i++) {
            const parent = path.dirname(cur)
            if (parent === cur) break
            try {
              if (statSync(parent).isDirectory()) return parent
            } catch {
              /* continue */
            }
            cur = parent
          }
          return base
        }

        server.middlewares.use('/api/config', async (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          try {
            const {
              readConfig,
              writeConfig,
              suggestedDefaults,
              hasMachineBlock,
            } = await getRouter()
            if (req.method === 'GET') {
              const config = readConfig()
              res.end(
                JSON.stringify({
                  ok: true,
                  config,
                  suggestions: suggestedDefaults(),
                }),
              )
              return
            }
            if (req.method === 'POST') {
              const body = await readJsonBody(req)
              if (body.routingMdPath) {
                if (!hasMachineBlock(body.routingMdPath)) {
                  res.statusCode = 400
                  res.end(
                    JSON.stringify({
                      ok: false,
                      errors: ['所选文件不是有效的 SKILL_ROUTING（缺少机器块标记）'],
                    }),
                  )
                  return
                }
              }
              const config = writeConfig(body)
              res.end(JSON.stringify({ ok: true, config }))
              return
            }
            res.statusCode = 405
            res.end(JSON.stringify({ ok: false, errors: ['仅支持 GET/POST'] }))
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, errors: [String(e)] }))
          }
        })

        server.middlewares.use('/api/graph', async (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          try {
            const { loadGraph, saveGraph } = await getRouter()
            if (req.method === 'GET') {
              res.end(JSON.stringify(loadGraph()))
            } else if (req.method === 'POST') {
              const graph = await readJsonBody(req)
              res.end(JSON.stringify(saveGraph(graph)))
            } else {
              res.statusCode = 405
              res.end(JSON.stringify({ ok: false, errors: ['仅支持 GET/POST'] }))
            }
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, errors: [String(e)] }))
          }
        })

        server.middlewares.use('/api/pick-file', async (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          try {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end(JSON.stringify({ ok: false, errors: ['仅支持 POST'] }))
              return
            }
            const result = await spawnPs(PICK_FILE)
            res.end(JSON.stringify(result))
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, errors: [String(e)] }))
          }
        })

        server.middlewares.use('/api/pick-folder', async (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          try {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end(JSON.stringify({ ok: false, errors: ['仅支持 POST'] }))
              return
            }
            const body = await readJsonBody(req)
            const { readConfig } = await getRouter()
            const cfg = readConfig()
            const start = body.path || cfg.skillsRoot || ''
            const initial = resolveListTarget(start, cfg)
            const result = await spawnPs(PICK_FOLDER, ['-InitialPath', initial])
            res.end(JSON.stringify(result))
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, errors: [String(e)] }))
          }
        })

        server.middlewares.use('/api/list-dir', async (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          try {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end(JSON.stringify({ ok: false, errors: ['仅支持 POST'] }))
              return
            }
            const body = await readJsonBody(req)
            const { readConfig } = await getRouter()
            const cfg = readConfig()
            const target = resolveListTarget(body.path, cfg)
            if (!statSync(target).isDirectory()) throw new Error('不是文件夹：' + target)
            const dirs = readdirSync(target, { withFileTypes: true })
              .filter((e) => e.isDirectory())
              .map((e) => e.name)
              .sort((a, b) => a.localeCompare(b))
            const parent = path.dirname(target)
            res.end(
              JSON.stringify({
                ok: true,
                path: target,
                parent: parent === target ? '' : parent,
                dirs,
                skillsRoot: skillsRootOrFallback(cfg),
                routingRoot: ROUTING_DIR,
              }),
            )
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, errors: [String(e)] }))
          }
        })
      },
    },
  ],
})
