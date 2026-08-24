/**
 * Skill 路由画板 · Electron 主进程
 * 启动本机 server.mjs + 打开画板窗口（可读本地磁盘路径）
 */
import { app, BrowserWindow } from 'electron'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import http from 'node:http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = Number(process.env.PORT || 5174)
const HEALTH_URL = `http://127.0.0.1:${PORT}/api/health`

function routingDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'routing')
  }
  return path.resolve(__dirname, '..')
}

function userConfigFile() {
  return path.join(app.getPath('userData'), 'local-config.json')
}

function defaultSkillsDir(routing) {
  const sibling = path.join(path.dirname(routing), 'skills')
  if (fs.existsSync(sibling)) return sibling
  return ''
}

function ensureUserConfig(routing, configFile) {
  const userMd = path.join(app.getPath('userData'), 'SKILL_ROUTING.md')
  const templateMd = path.join(routing, 'SKILL_ROUTING.md')
  if (!fs.existsSync(userMd) && fs.existsSync(templateMd)) {
    fs.copyFileSync(templateMd, userMd)
  }

  if (fs.existsSync(configFile)) return

  const skills = defaultSkillsDir(routing)
  const mdPath = fs.existsSync(userMd) ? userMd : templateMd
  const cfg = {
    routingMdPath: fs.existsSync(mdPath) ? mdPath : '',
    skillsRoot: skills,
    defaultSkillsRoot: skills,
    updatedAt: new Date().toISOString().slice(0, 10),
  }
  fs.writeFileSync(configFile, JSON.stringify(cfg, null, 2), 'utf8')
}

function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tick = () => {
      http
        .get(url, (res) => {
          res.resume()
          if (res.statusCode === 200) resolve()
          else if (Date.now() - start > timeoutMs) reject(new Error(`health ${res.statusCode}`))
          else setTimeout(tick, 200)
        })
        .on('error', () => {
          if (Date.now() - start > timeoutMs) reject(new Error('server timeout'))
          else setTimeout(tick, 200)
        })
    }
    tick()
  })
}

let serverProcess = null
let mainWindow = null

function startServer(routing, configFile) {
  ensureUserConfig(routing, configFile)
  const serverPath = path.join(routing, 'server.mjs')

  serverProcess = spawn(process.execPath, [serverPath], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      ROUTING_DIR: routing,
      SKILL_ROUTING_CONFIG_FILE: configFile,
      PORT: String(PORT),
      ENABLE_NATIVE_PICK: '1',
      SKILL_ROUTING_ELECTRON: '1',
    },
    stdio: 'inherit',
    windowsHide: true,
  })

  serverProcess.on('error', (err) => {
    console.error('[electron] server spawn error', err)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    title: 'Skill 路由画板',
    autoHideMenuBar: true,
  })
  mainWindow.loadURL(`http://127.0.0.1:${PORT}/`)
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function stopServer() {
  if (!serverProcess) return
  try {
    serverProcess.kill()
  } catch {
    /* ignore */
  }
  serverProcess = null
}

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(async () => {
    const routing = routingDir()
    const configFile = userConfigFile()
    startServer(routing, configFile)
    try {
      await waitForServer(HEALTH_URL)
    } catch (e) {
      console.error('[electron] server failed to start', e)
      app.quit()
      return
    }
    createWindow()
  })

  app.on('window-all-closed', () => {
    stopServer()
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('before-quit', () => {
    stopServer()
  })

  app.on('activate', () => {
    if (mainWindow === null && serverProcess) createWindow()
  })
}
