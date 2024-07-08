document.addEventListener('DOMContentLoaded', (event) => {
    refreshBrowsers();
  
    document.getElementById('refreshBrowsersButton').onclick = refreshBrowsers;
    document.getElementById('pingButton').onclick = pingServer;
    document.getElementById('openBrowserButton').onclick = openBrowser;
    document.getElementById('closeBrowserButton').onclick = closeBrowser;
    document.getElementById('getTitleButton').onclick = getTitle;
    document.getElementById('toggleHeadlessButton').onclick = toggleHeadless;
    document.getElementById('getCookiesButton').onclick = getCookies;
    document.getElementById('loadCookiesButton').onclick = loadCookies;
    document.getElementById('startWorkerButton').onclick = startWorker;
    document.getElementById('stopWorkerButton').onclick = stopWorker;
  });
  
  const showMessage = (message) => {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerText = message;
  };
  
  const getCookies = async () => {
    const browserId = getSelectedBrowserId();
    if (!browserId) return;
  
    const filePath = await window.api.showSaveDialog();
    if (filePath) {
      window.api.receive('cookies-saved', (cookies) => {
        console.log('Cookies saved:', cookies);
        showMessage('Cookies saved');
      });
      window.api.getCookies(browserId, filePath);
    }
  };
  
  const loadCookies = async () => {
    const browserId = getSelectedBrowserId();
    if (!browserId) return;
  
    const filePath = await window.api.showOpenDialog();
    if (filePath) {
      window.api.loadCookies(browserId, filePath);
    }
  };
  
  const pingServer = () => {
    fetch('http://localhost:5005/browser/ping')
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        showMessage(data.message);
      })
      .catch(error => console.error('Error:', error));
  };
  
  const openBrowser = () => {
    fetch('http://localhost:5005/browser/open', { method: 'POST' })
      .then(response => response.json())
      .then(data => {
        console.log(`Браузер открыт ${data.browser_id}`);
        showMessage(`Браузер открыт ${data.browser_id}`);
        refreshBrowsers();
      })
      .catch(error => console.error('Error:', error));
  };
  
  const closeBrowser = () => {
    const browserId = getSelectedBrowserId();
    if (!browserId) return;
  
    fetch(`http://localhost:5005/browser/close/${browserId}`, { method: 'POST' })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        showMessage(data.message);
        refreshBrowsers();
      })
      .catch(error => console.error('Error:', error));
  };
  
  const getTitle = () => {
    const browserId = getSelectedBrowserId();
    if (!browserId) return;
  
    fetch(`http://localhost:5005/browser/title/${browserId}`)
      .then(response => response.json())
      .then(data => {
        console.log(data.title);
        showMessage(`Title: ${data.title}`);
      })
      .catch(error => console.error('Error:', error));
  };
  
  const toggleHeadless = () => {
    const browserId = getSelectedBrowserId();
    if (!browserId) return;
  
    fetch(`http://localhost:5005/browser/toggle_headless/${browserId}`, { method: 'POST' })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        showMessage(data.message);
      })
      .catch(error => console.error('Error:', error));
  };
  
  const startWorker = () => {
    const browserId = getSelectedBrowserId();
    if (!browserId) return;
  
    fetch(`http://localhost:5005/browser/worker/start/${browserId}`, { method: 'POST' })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        showMessage(data.message);
      })
      .catch(error => console.error('Error:', error));
  };
  
  const stopWorker = () => {
    const browserId = getSelectedBrowserId();
    if (!browserId) return;
  
    fetch(`http://localhost:5005/browser/worker/stop/${browserId}`, { method: 'POST' })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        showMessage(data.message);
      })
      .catch(error => console.error('Error:', error));
  };
  
  const refreshBrowsers = () => {
    fetch('http://localhost:5005/browser/browsers')
      .then(response => response.json())
      .then(data => {
        const browserList = document.getElementById('browserList');
        browserList.innerHTML = ''; // Очистка списка перед обновлением
  
        data.browsers.forEach(browser => {
          const browserItem = document.createElement('div');
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = browser;
          checkbox.name = 'browser';
          checkbox.value = browser;
          checkbox.onclick = handleCheckboxClick;
  
          const label = document.createElement('label');
          label.htmlFor = browser;
          label.innerText = `Browser ID: ${browser}`;
  
          browserItem.appendChild(checkbox);
          browserItem.appendChild(label);
          browserList.appendChild(browserItem);
        });
      })
      .catch(error => console.error('Error:', error));
  };
  
  const handleCheckboxClick = (event) => {
    const checkboxes = document.querySelectorAll('input[name="browser"]');
    checkboxes.forEach(checkbox => {
      if (checkbox !== event.target) {
        checkbox.checked = false;
      }
    });
  };
  
  const getSelectedBrowserId = () => {
    const checkboxes = document.querySelectorAll('input[name="browser"]:checked');
    if (checkboxes.length > 0) {
      return checkboxes[0].value;
    } else {
      console.error('No browser selected');
      return null;
    }
  };
  