const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  loadPage: (page) => ipcRenderer.send('load-page', page),
  minimize: () => ipcRenderer.send('minimize'),
  close: () => ipcRenderer.send('close'),
  getCurrentPage: () => ipcRenderer.invoke('getCurrentPage'),
  setCurrentPage: (page) => ipcRenderer.invoke('setCurrentPage', page),
  login: (username, password) => ipcRenderer.invoke('login', username, password),
  getCookies: (browserId, filePath) => ipcRenderer.invoke('get-cookies', { browserId, filePath }),
  loadCookies: (browserId, filePath) => ipcRenderer.invoke('load-cookies', { browserId, filePath }),
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  receive: (channel, func) => {
    let validChannels = ['cookies-saved'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});



ipcRenderer.on('navigate-to', (event, page) => {
  fetch(`../templates/${page}`)
    .then(response => response.text())
    .then(data => {
      document.getElementById('content').innerHTML = data;
    })
    .catch(err => console.error('Error loading page:', err));
});
