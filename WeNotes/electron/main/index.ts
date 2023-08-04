import { app, BrowserWindow, shell, ipcMain, Tray, Menu } from 'electron'
import { release } from 'os'
import { join } from 'path'
import pkg from '../../package.json'
// import { logger } from '../winston'
import './ipcHandlers'

// Disable GPU Acceleration for Windows 7
// if (release().startsWith('6.1')) {
app.disableHardwareAcceleration()
// }

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

export const ROOT_PATH = {
  // /dist
  dist: join(__dirname, '../..'),
  // /dist or /public
  public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
}

export let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL as string
const indexHtml = join(ROOT_PATH.dist, 'index.html')
const icon = join(ROOT_PATH.public, 'icon.ico')
let tray = null
async function createWindow() {
  win = new BrowserWindow({
    title: pkg.displayName,
    icon,
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false,
      devTools: !app.isPackaged,
    },
    minHeight: 650,
    minWidth: 1000,
    height: 650,
    width: 1100,
    frame: true,
    transparent: true,
    titleBarStyle: 'hidden',
    show: false,
  })

  // Disable menu bar
  win.menuBarVisible = false

  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'show Notes',
      click: () => {
        win.show()
        win.setSkipTaskbar(true)
      },
    },
    {
      label: 'quit',
      click: () => {
        app.quit()
      },
    },
  ])
  tray.setToolTip('Notes')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    if (win.isVisible()) {
      win.hide()
      win.setSkipTaskbar(true)
    } else {
      win.show()
      win.setSkipTaskbar(false)
    }
  })

  if (app.isPackaged) {
    await win.loadFile(indexHtml)
  } else {
    await win.loadURL(url)
    // Open devTool if the app is not packaged
    // win.webContents.openDevTools()
  }
  win.show()
  win.setSkipTaskbar(true)

  win.on('close', (event) => {
    event.preventDefault()
    win.hide()
    win.setSkipTaskbar(true)
  })
}

app.whenReady().then(() => {
  createWindow()
})

app.on('web-contents-created', (e, webContents) => {
  webContents.setWindowOpenHandler(({ url, frameName }) => {
    console.log(url)
    shell.openExternal(url)
    return { action: 'deny' }
  })
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// new window example arg: new windows url
ipcMain.handle('open-win', (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
    },
  })

  if (app.isPackaged) {
    childWindow.loadFile(indexHtml, { hash: arg })
  } else {
    childWindow.loadURL(`${url}/#${arg}`)
    // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
  }
})
