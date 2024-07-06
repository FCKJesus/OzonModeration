const fs = require('fs');
const path = require('path');
const { app, safeStorage } = require('electron');

const storageFilePath = path.join(app.getPath('userData'), 'currentPage.txt');

// Обработчик логина
const handleLogin = async (event, username, password) => {
  if (username === 'admin' && password === 'admin') {
    return { success: true };
  } else {
    return { success: false, message: 'INVALID NAME OR PASSWORD' };
  }
};

// Обработчик получения текущей страницы
const handleGetCurrentPage = () => {
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
};

// Обработчик установки текущей страницы
const handleSetCurrentPage = (event, page) => {
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
};

module.exports = {
  handleLogin,
  handleGetCurrentPage,
  handleSetCurrentPage,
};
