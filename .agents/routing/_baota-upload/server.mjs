#!/usr/bin/env node
/**
 * 生产服务：API（router）+ 可选托管 panel/dist
 * 用法：
 *   PORT=5174 node server.mjs
 *   或 PM2：pm2 start server.mjs --name skill-routing
 *
 * 环境变量：
 *   PORT          默认 5174
 *   ROUTING_DIR   默认本文件所在目录
 *   STATIC_DIR    默认 ./panel/dist；设为空字符串则不托管静态
 *   ENABLE_NATIVE_PICK  默认仅 win32 开启；设 0 强制关闭
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawn } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROUTING_DIR = process.env.ROUTING_DIR
  ? path.resolve(process.env.ROUTING_DIR)
  : __dirname
const PORT = Number(process.env.PORT || 5174)
const STATIC_DIR =
  process.env.STATIC_DIR === ''
    ? ''
    : path.resolve(process.env.STATIC_DIR || path.join(ROUTING_DIR, 'panel', 'dist'))
const FALLBACK_SKILLS = path.join(ROUTING_DIR, '..', 'skills')
const IS_WIN = process.platform === 'win32'
const ENABLE_NATIVE_PICK =
  process.env.ENABLE_NATIVE_PICK === '1' ||
  (process.env.ENABLE_NATIVE_PICK !== '0' && IS_WIN)

const routerUrl = pathToFileURL(path.join(ROUTING_DIR, 'router.mjs')).href
const PICK_FOLDER = path.join(ROUTING_DIR, 'panel', 'scripts', 'pick-folder.ps1')
const PICK_FILE = path.join(ROUTING_DIR, 'panel', 'scripts', 'pick-file.ps1')

let routerMod
async function getRouter() {
  if (!routerMod) routerMod = await import(routerUrl)
  return routerMod
}

async function readJsonBody(req) {
  let body = ''
  for await (const chunk of req) body += chunk
  try {
    return JSON.parse(body || '{}')
  } catch {
    return {}
  }
}

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(obj))
}

function skillsRootOrFallback(cfg) {
  const root = (cfg && cfg.skillsRoot) || ''
  if (root) {
    try {
      if (fs.statSync(root).isDirectory()) return root
    } catch {
      /* fall */
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
    if (fs.statSync(target).isDirectory()) return target
  } catch {
    /* ENOENT */
  }
  let cur = target
  for (let i = 0; i < 8; i++) {
    const parent = path.dirname(cur)
    if (parent === cur) break
    try {
      if (fs.statSync(parent).isDirectory()) return parent
    } catch {
      /* continue */
    }
    cur = parent
  }
  return base
}

function spawnPs(script, extraArgs = []) {
  return new Promise((resolve) => {
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-STA', '-ExecutionPolicy', 'Bypass', '-File', script, ...extraArgs],
      { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] },
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

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

function serveStatic(req, res) {
  if (!STATIC_DIR) {
    sendJson(res, 404, { ok: false, errors: ['未配置静态目录'] })
    return
  }
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  if (urlPath === '/') urlPath = '/index.html'
  const filePath = path.normalize(path.join(STATIC_DIR, urlPath))
  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }
  let finalPath = filePath
  if (!fs.existsSync(finalPath) || fs.statSync(finalPath).isDirectory()) {
    finalPath = path.join(STATIC_DIR, 'index.html')
  }
  if (!fs.existsSync(finalPath)) {
    res.writeHead(404)
    res.end('Not Found')
    return
  }
  const ext = path.extname(finalPath)
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
  fs.createReadStream(finalPath).pipe(res)
}

async function handleApi(req, res) {
  const url = (req.url || '').split('?')[0]

  if (url === '/api/health') {
    sendJson(res, 200, { ok: true, routingDir: ROUTING_DIR, staticDir: STATIC_DIR || null })
    return
  }

  if (url === '/api/config') {
    try {
      const { readConfig, writeConfig, suggestedDefaults, hasMachineBlock } = await getRouter()
      if (req.method === 'GET') {
        sendJson(res, 200, { ok: true, config: readConfig(), suggestions: suggestedDefaults() })
        return
      }
      if (req.method === 'POST') {
        const body = await readJsonBody(req)
        if (body.routingMdPath && !hasMachineBlock(body.routingMdPath)) {
          sendJson(res, 400, { ok: false, errors: ['所选文件不是有效的 SKILL_ROUTING（缺少机器块标记）'] })
          return
        }
        sendJson(res, 200, { ok: true, config: writeConfig(body) })
        return
      }
      sendJson(res, 405, { ok: false, errors: ['仅支持 GET/POST'] })
    } catch (e) {
      sendJson(res, 400, { ok: false, errors: [String(e)] })
    }
    return
  }

  if (url === '/api/graph') {
    try {
      const { loadGraph, saveGraph } = await getRouter()
      if (req.method === 'GET') {
        sendJson(res, 200, loadGraph())
        return
      }
      if (req.method === 'POST') {
        const graph = await readJsonBody(req)
        sendJson(res, 200, saveGraph(graph))
        return
      }
      sendJson(res, 405, { ok: false, errors: ['仅支持 GET/POST'] })
    } catch (e) {
      sendJson(res, 400, { ok: false, errors: [String(e)] })
    }
    return
  }

  if (url === '/api/pick-file' || url === '/api/pick-folder') {
    if (req.method !== 'POST') {
      sendJson(res, 405, { ok: false, errors: ['仅支持 POST'] })
      return
    }
    if (!ENABLE_NATIVE_PICK) {
      sendJson(res, 200, {
        ok: false,
        cancelled: false,
        errors: ['线上环境不支持系统对话框，请用手填路径或「面板浏览」'],
      })
      return
    }
    try {
      if (url === '/api/pick-file') {
        sendJson(res, 200, await spawnPs(PICK_FILE))
        return
      }
      const body = await readJsonBody(req)
      const { readConfig } = await getRouter()
      const cfg = readConfig()
      const initial = resolveListTarget(body.path || cfg.skillsRoot || '', cfg)
      sendJson(res, 200, await spawnPs(PICK_FOLDER, ['-InitialPath', initial]))
    } catch (e) {
      sendJson(res, 400, { ok: false, errors: [String(e)] })
    }
    return
  }

  if (url === '/api/list-dir') {
    try {
      if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, errors: ['仅支持 POST'] })
        return
      }
      const body = await readJsonBody(req)
      const { readConfig } = await getRouter()
      const cfg = readConfig()
      const target = resolveListTarget(body.path, cfg)
      if (!fs.statSync(target).isDirectory()) throw new Error('不是文件夹：' + target)
      const dirs = fs
        .readdirSync(target, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort((a, b) => a.localeCompare(b))
      const parent = path.dirname(target)
      sendJson(res, 200, {
        ok: true,
        path: target,
        parent: parent === target ? '' : parent,
        dirs,
        skillsRoot: skillsRootOrFallback(cfg),
        routingRoot: ROUTING_DIR,
      })
    } catch (e) {
      sendJson(res, 400, { ok: false, errors: [String(e)] })
    }
    return
  }

  sendJson(res, 404, { ok: false, errors: ['未知 API'] })
}

const server = http.createServer(async (req, res) => {
  try {
    const url = req.url || '/'
    if (url.startsWith('/api/')) {
      await handleApi(req, res)
      return
    }
    if (req.method === 'GET' || req.method === 'HEAD') {
      serveStatic(req, res)
      return
    }
    res.writeHead(405)
    res.end('Method Not Allowed')
  } catch (e) {
    sendJson(res, 500, { ok: false, errors: [String(e)] })
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[skill-routing] http://127.0.0.1:${PORT}`)
  console.log(`  ROUTING_DIR=${ROUTING_DIR}`)
  console.log(`  STATIC_DIR=${STATIC_DIR || '(off)'}`)
  console.log(`  ENABLE_NATIVE_PICK=${ENABLE_NATIVE_PICK}`)
})
