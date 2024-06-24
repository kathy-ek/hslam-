import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { exec } from 'child_process'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    title: 'HSLAM Initialization'
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  ipcMain.handle('open-folder-dialog', async () => {
    return new Promise((resolve, reject) => {
      dialog
        .showOpenDialog(mainWindow, {
          properties: ['openDirectory']
        })
        .then((result) => {
          if (!result.canceled && result.filePaths.length > 0) {
            const selectedPath = result.filePaths[0]
            resolve(selectedPath)
          } else {
            reject('No folder selected')
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

app.disableHardwareAcceleration()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('hslam-initialization', async (event, values) => {
    return new Promise((resolve, reject) => {
      const executableFile = `${values.workspaceDir}/build/bin/HSLAM `

      const rosCommand = `rosrun fslam_ros fslam_live image:=${values.cameraPath} calib=${values.calibFile} gamma=${values.gammaFile} vignette=${values.vignetteFile}`

      const cppCommand =
        executableFile +
        `${values.dataType === 'dataset' ? `--files="${values.datasetPath}" ` : ''}` +
        `--calib="${values.calibFile}" ` +
        `${values.photometric ? `--gamma="${values.gammaFile}" ` : ''}` +
        `${values.photometric ? `--vignette="${values.vignetteFile}" ` : ''}` +
        `${values.loopClosure ? '--LoopClosure=True ' : '--LoopClosure=False '}` +
        `${!values.fileLogging ? '--noLog=True ' : '--noLog=False '}` +
        `${values.sequenceReversed ? '--reverse=True ' : '--reverse=False '} ` +
        `${!values.viewerGUI ? '--nogui=True ' : '--nogui=False '}`

      let command = values.dataType === 'dataset' ? cppCommand : rosCommand

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Error executing HSLAM:', stderr)
          reject(stderr)
        } else {
          console.log('Output from HSLAM:', stdout)
          resolve(stdout)
        }
      })
    })
  })

  ipcMain.on('open-rviz', (event, values) => {
    return new Promise((resolve, reject) => {
      const command = '/opt/ros/foxy/bin/rviz2'
      const env = Object.assign({}, process.env)
      env.LD_LIBRARY_PATH = [
        '/opt/ros/foxy/lib',
        '/opt/ros/foxy/opt/yaml_cpp_vendor/lib',
        '/opt/ros/foxy/opt/rviz_ogre_vendor/lib',
        '/opt/ros/foxy/lib/x86_64-linux-gnu',
        '/opt/ros/foxy/lib',
        '/home/user/catkin_ws/src/FSLAM/Thirdparty/CompiledLibs/lib',
        env.LD_LIBRARY_PATH || ''
      ].join(':')

      // Set AMENT_PREFIX_PATH to /opt/ros/foxy
      env.AMENT_PREFIX_PATH = '/opt/ros/foxy'

      exec(command, { env }, (error, stdout, stderr) => {
        if (error) {
          console.error('Error opening RVIZ:', stderr)
          reject(stderr)
        } else {
          console.log('Output from RVIZ2:', stdout)
          resolve(stdout)
        }
      })
    })
  })

  ipcMain.handle('quit-application', async (event, values) => {
    return new Promise((resolve, reject) => {
      app.quit()
      resolve('Application has been closed')
    })
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
