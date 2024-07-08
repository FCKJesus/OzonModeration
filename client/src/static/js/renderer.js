document.addEventListener('DOMContentLoaded', async (event) => {
  document.getElementById('minimize').addEventListener('click', () => {
    window.api.minimize();
  });

  document.getElementById('close').addEventListener('click', () => {
    window.api.close();
  });

  const loadPage = async (page) => {
    await window.api.setCurrentPage(page);
    window.api.loadPage(page);
  };

  const currentPage = await window.api.getCurrentPage();
  window.api.loadPage(currentPage);
});

const handleLogin = async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const result = await window.api.login(username, password);

  if (result.success) {
    await window.api.setCurrentPage('index.html');
    window.api.loadPage('index.html');
  } else {
    document.getElementById('error-message').innerText = result.message;
  }
};
