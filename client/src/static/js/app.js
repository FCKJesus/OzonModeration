document.addEventListener('DOMContentLoaded', (event) => {
  const refreshBrowsersButton = document.getElementById('refreshBrowsersButton');
  const pingButton = document.getElementById('pingButton');
  const openBrowserButton = document.getElementById('openBrowserButton');
  const closeBrowserButton = document.getElementById('closeBrowserButton');
  const getTitleButton = document.getElementById('getTitleButton');
  const toggleHeadlessButton = document.getElementById('toggleHeadlessButton');
  const getCookiesButton = document.getElementById('getCookiesButton');
  const loadCookiesButton = document.getElementById('loadCookiesButton');
  const startWorkerButton = document.getElementById('startWorkerButton');
  const stopWorkerButton = document.getElementById('stopWorkerButton');
  const logoutButton = document.getElementById('logoutButton');

  if (refreshBrowsersButton) refreshBrowsersButton.onclick = refreshBrowsers;
  if (pingButton) pingButton.onclick = pingServer;
  if (openBrowserButton) openBrowserButton.onclick = openBrowser;
  if (closeBrowserButton) closeBrowserButton.onclick = closeBrowser;
  if (getTitleButton) getTitleButton.onclick = getTitle;
  if (toggleHeadlessButton) toggleHeadlessButton.onclick = toggleHeadless;
  if (getCookiesButton) getCookiesButton.onclick = getCookies;
  if (loadCookiesButton) loadCookiesButton.onclick = loadCookies;
  if (startWorkerButton) startWorkerButton.onclick = startWorker;
  if (stopWorkerButton) stopWorkerButton.onclick = stopWorker;
  if (logoutButton) logoutButton.onclick = () => loadPage('login.html');

  window.api.receive('show-message', (message) => {
    showMessage(message);
  });

  refreshBrowsers();  // Обновление списка браузеров при загрузке страницы
});

const showMessage = (message) => {
  const messagesContainer = document.getElementById('messages');
  if (messagesContainer) {
    messagesContainer.innerText = message;
  }
};

const loadPage = (page) => {
  window.api.setCurrentPage(page);
  window.api.loadPage(page);
};

const getCookies = async () => {
  const browserId = getSelectedBrowserId();
  if (!browserId) return;

  const filePath = await window.api.showSaveDialog();
  if (filePath) {
    window.api.receive('cookies-saved', (cookies) => {
      console.log('Cookies saved:', cookies);
      showMessage('Куки сохранены');
    });
    window.api.receive('cookies-error', (error) => {
      console.error('Error saving cookies:', error);
      showMessage('Ошибка при сохранении куков');
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
    .catch(error => {
      console.error('Error:', error);
      showMessage('Ошибка при запросе ping');
    });
};

const openBrowser = () => {
  fetch('http://localhost:5005/browser/open', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
      console.log(`Браузер открыт ${data.browser_id}`);
      showMessage(`Браузер открыт ${data.browser_id}`);
      refreshBrowsers();
    })
    .catch(error => {
      console.error('Error:', error);
      showMessage('Ошибка при открытии браузера');
    });
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
    .catch(error => {
      console.error('Error:', error);
      showMessage('Ошибка при закрытии браузера');
    });
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
    .catch(error => {
      console.error('Error:', error);
      showMessage('Ошибка при получении заголовка');
    });
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
    .catch(error => {
      console.error('Error:', error);
      showMessage('Ошибка при переключении headless режима');
    });
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
    .catch(error => {
      console.error('Error:', error);
      showMessage('Ошибка при запуске воркера');
    });
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
    .catch(error => {
      console.error('Error:', error);
      showMessage('Ошибка при остановке воркера');
    });
};

const refreshBrowsers = () => {
  fetch('http://localhost:5005/browser/browsers')
    .then(response => response.json())
    .then(data => {
      const browserList = document.getElementById('browserList');
      if (browserList) {
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
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showMessage('Ошибка при обновлении списка браузеров');
    });
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
    showMessage('Не выбран браузер');
    return null;
  }
};
