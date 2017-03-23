/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import { app, BrowserWindow, Menu, shell } from 'electron'

import AppConstants from './constants'

let menu
let template
let mainWindow = null
let MetaStorage

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support') // eslint-disable-line
  sourceMapSupport.install()
}

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')() // eslint-disable-line global-require
  const path = require('path') // eslint-disable-line
  const p = path.join(__dirname, '..', 'app', 'node_modules') // eslint-disable-line
  require('module').globalPaths.push(p) // eslint-disable-line
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer') // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ]
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS
    for (const name of extensions) { // eslint-disable-line
      try {
        await installer.default(installer[name], forceDownload)
      } catch (e) {} // eslint-disable-line
    }
  }
}

app.on('ready', async () => {
  await installExtensions()

  mainWindow = new BrowserWindow({
    show: false,
    width: AppConstants.INITIAL_WINDOW_WIDTH,
    height: AppConstants.INITIAL_WINDOW_HEIGHT,
    title: AppConstants.APP_NAME
  })

  mainWindow.loadURL(`file://${__dirname}/app.html`)

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  /*
  mainWindow.on('resize', function(e) {

    if (!MetaStorage) {
      try {
        console.log('trying to get storage')
        MetaStorage = require('./models/storage/meta-storage')
      } catch (err) { console.log("failed to get storage: " + err)}
    }

    if (MetaStorage) {
      let windowSize = mainWindow.getSize()

      let width = windowSize[0]
      let height = windowSize[1]

      // remember user's window-size preferences
      MetaStorage.updateWindowSize(width, height)
    }
  })
  */

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools()
    mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          mainWindow.inspectElement(x, y)
        }
      }]).popup(mainWindow)
    })
  }

  if (process.platform === 'darwin') {
    template = [{
      label: AppConstants.APP_NAME,
      submenu: [{
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
          app.quit()
        }
      }]
    }, {
      label: "Edit",
      submenu: [
          { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]},
    {
      label: 'View',
      submenu: [{
        label: 'Reload',
        accelerator: 'Command+R',
        click() {
          mainWindow.webContents.reload()
        }
      }]
    }, {
      label: 'Window',
      submenu: [{
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:'
      }, {
        label: 'Close',
        accelerator: 'Command+W',
        selector: 'performClose:'
      }],
    }, {
      label: 'Help',
      submenu: [{
        label: 'Website',
        click() {
          shell.openExternal('https://algernon.io')
        }
      }]
    }]

    menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  } else {
    // TODO - set for windows
  }
})
