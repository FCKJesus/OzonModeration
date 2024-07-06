const { startServer, stopServer } = require('./src/server');
const { app, BrowserWindow, ipcMain, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');

const storageFilePath = path.join(app.getPath('userData'), 'currentPage.txt');


let mainWindow;
let splash;


function createWindow () {


    splash = new BrowserWindow({
        width: 600,
        height: 600,
        frame: false,
        alwaysOnTop: true,
        transparent: true
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
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'templates', 'base.html'));

    mainWindow.once('ready-to-show', () => {
        setTimeout(() => {
            splash.destroy();
            mainWindow.show();
        }, 5000);
    });

    
    ipcMain.handle('login', async (event, username, password) => {
      if (username === 'admin' && password === 'admin') {
        return { success: true };
      } else {
        return { success: false, message: 'Invalid username or password' };
      }
    });

    

    // Обработчик для получения текущей страницы
    ipcMain.handle('getCurrentPage', () => {
      try {
        if (fs.existsSync(storageFilePath)) {
          console.log('Файл существует, читаем содержимое...');
          const encryptedData = fs.readFileSync(storageFilePath);
          if (safeStorage.isEncryptionAvailable()) {
            const decryptedData = safeStorage.decryptString(encryptedData);
            console.log('Данные расшифрованы:', decryptedData);
            return decryptedData;
          } else {
            console.error('Шифрование недоступно');
          }
        } else {
          console.log('Файл не существует, создаем его...');
          if (safeStorage.isEncryptionAvailable()) {
            const encryptedData = safeStorage.encryptString('login.html');
            fs.writeFileSync(storageFilePath, encryptedData);
            console.log('Файл создан с зашифрованной страницей login.html');
            return 'login.html';
          } else {
            console.error('Шифрование недоступно');
          }
        }
      } catch (error) {
        console.error('Ошибка при чтении currentPage:', error);
      }
      return 'login.html';
    });

    // Обработчик для установки текущей страницы
    ipcMain.handle('setCurrentPage', (event, page) => {
      try {
        if (safeStorage.isEncryptionAvailable()) {
          const encryptedData = safeStorage.encryptString(page);
          fs.writeFileSync(storageFilePath, encryptedData);
          console.log(`Страница ${page} была зашифрована и сохранена.`);
        } else {
          console.error('Шифрование недоступно');
        }
      } catch (error) {
        console.error('Ошибка при записи currentPage:', error);
      }
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
