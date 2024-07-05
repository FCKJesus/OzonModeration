
const { startServer, stopServer } = require('./src/server');


const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let splash;

function createWindow() {
  // Создаем окно загрузки
  splash = new BrowserWindow({
    width: 600,
    height: 600,
    frame: false,
    alwaysOnTop: true,
    transparent: true
  });

  splash.loadFile(path.join(__dirname, 'src', 'templates', 'splash.html'));

  // Создаем основное окно
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    frame: false,
    transparent: true, // Устанавливаем прозрачность окна
    show: false,
    resizable: false, // Отключаем возможность изменения размера
    useContentSize: true, // Используем фиксированный размер контента
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'templates', 'base.html'));

  // Добавляем задержку перед показом основного окна
  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      splash.destroy();
      mainWindow.show();
    }, 5000); // Задержка в 5 секунд
  });
}
  app.whenReady().then(() => {
    startServer(); // Запуск Flask сервера
  });

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
    stopServer(); // Остановка Flask сервера при выходе
    mainWindow.close();
  });
  
  app.on('ready', createWindow);
  
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
  