document.getElementById('minimize').addEventListener('click', () => {
  window.api.minimize();
});

document.getElementById('close').addEventListener('click', () => {
  window.api.close();
});

function loadPage(page) {
  window.api.loadPage(page);
}
