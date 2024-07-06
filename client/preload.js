const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    loadPage: (page) => ipcRenderer.send('load-page', page),
    minimize: () => ipcRenderer.send('minimize'),
    close: () => ipcRenderer.send('close'),
    getCurrentPage: () => ipcRenderer.invoke('getCurrentPage'),
    setCurrentPage: (page) => ipcRenderer.invoke('setCurrentPage', page),
    login: (username, password) => ipcRenderer.invoke('login', username, password)
});

ipcRenderer.on('navigate-to', (event, page) => {
  fetch(`../templates/${page}`)
    .then(response => response.text())
    .then(data => {
      document.getElementById('content').innerHTML = data;
    })
    .catch(err => console.error('Error loading page:', err));
});

