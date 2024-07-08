const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
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

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Get Cookies from Server',
          click: () => {
            dialog.showSaveDialog(mainWindow, {
              title: 'Save Cookies from Server',
              defaultPath: path.join(app.getPath('desktop'), 'cookies.pkl'),
              filters: [
                { name: 'PKL Files', extensions: ['pkl'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            }).then(result => {
              if (!result.canceled) {
                mainWindow.webContents.send('get-cookies', result.filePath);
              }
            });
          }
        },
        {
          label: 'Load Cookies to Server',
          click: () => {
            dialog.showOpenDialog(mainWindow, {
              title: 'Load Cookies to Server',
              defaultPath: app.getPath('desktop'),
              filters: [
                { name: 'PKL Files', extensions: ['pkl'] },
                { name: 'All Files', extensions: ['*'] }
              ],
              properties: ['openFile']
            }).then(result => {
              if (!result.canceled) {
                mainWindow.webContents.send('load-cookies', result.filePaths[0]);
              }
            });
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Ctrl+Shift+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);

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

  ipcMain.handle('get-cookies', async (event, { browserId, filePath }) => {
    const options = {
      hostname: 'localhost',
      port: 5005,
      path: `/browser/get_cookies/${browserId}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const cookies = response.cookies;
          fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2));
          event.sender.send('cookies-saved', cookies);
          mainWindow.webContents.send('show-message', 'Куки сохранены');
        } catch (err) {
          console.error('Error parsing JSON response:', err);
          console.error('Response data:', data);
          event.sender.send('cookies-error', 'Error parsing JSON response');
          mainWindow.webContents.send('show-message', 'Ошибка при сохранении куков');
        }
      });
    });

    req.on('error', (e) => {
      console.error(e);
      event.sender.send('cookies-error', e.message);
      mainWindow.webContents.send('show-message', `Ошибка: ${e.message}`);
    });

    req.end();
  });

  ipcMain.handle('load-cookies', async (event, { browserId, filePath }) => {
    const cookies = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const options = {
      hostname: 'localhost',
      port: 5005,
      path: `/browser/load_cookies/${browserId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify({ cookies }))
      }
    };

    const req = http.request(options, (res) => {
      res.on('data', (chunk) => {
        console.log('Response:', chunk.toString());
      });

      res.on('end', () => {
        console.log('Cookies loaded to server');
        mainWindow.webContents.send('show-message', 'Куки загружены');
      });
    });

    req.on('error', (e) => {
      console.error(e);
      mainWindow.webContents.send('show-message', `Ошибка: ${e.message}`);
    });

    req.write(JSON.stringify({ cookies }));
    req.end();
  });

  ipcMain.handle('show-save-dialog', async (event) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Cookies from Server',
      defaultPath: path.join(app.getPath('desktop'), 'cookies.pkl'),
      filters: [
        { name: 'PKL Files', extensions: ['pkl'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    return result.filePath;
  });

  ipcMain.handle('show-open-dialog', async (event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Load Cookies to Server',
      defaultPath: app.getPath('desktop'),
      filters: [
        { name: 'PKL Files', extensions: ['pkl'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    return result.filePaths[0];
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
