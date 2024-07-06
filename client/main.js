const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { handleLogin, handleGetCurrentPage, handleSetCurrentPage } = require('./src/handlers');
const { startServer, stopServer } = require('./src/server');

const storageFilePath = path.join(app.getPath('userData'), 'currentPage.txt');

let mainWindow;
let splash;

function createWindow() {
  splash = new BrowserWindow({
    width: 600,
    height: 600,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
  });

  splash.loadFile(path.join(__dirname, 'src', 'templates', 'splash.html'));

  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    frame: false,
    transparent: true,
    show: false,
    resizable: false,
    useContentSize: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'templates', 'base.html'));

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      splash.destroy();
      mainWindow.show();
    }, 5000);
  });

  // Регистрация обработчиков IPC
  ipcMain.handle('login', handleLogin);
  ipcMain.handle('getCurrentPage', handleGetCurrentPage);
  ipcMain.handle('setCurrentPage', handleSetCurrentPage);

  ipcMain.on('load-page', (event, page) => {
    console.log(`Loading page: ${page}`);
    mainWindow.webContents.send('navigate-to', page);
  });

  ipcMain.on('minimize', () => {
    console.log('Minimizing window');
    mainWindow.minimize();
  });

  ipcMain.on('close', () => {
    console.log('Closing window');
    stopServer();
    mainWindow.close();
  });
}

app.whenReady().then(() => {
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('Activating app');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
