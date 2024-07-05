const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

let flaskProcess;

function startServer() {
  const platform = os.platform();
  const isWindows = platform === 'win32';

  const command = isWindows ? 'python' : 'python3';
  const scriptPath = path.join(__dirname, './../../', 'server',  'setup.py');
  
  flaskProcess = spawn(command, [scriptPath]);

  flaskProcess.stdout.on('data', (data) => {
    console.log(`Flask: ${data}`);
  });

  flaskProcess.stderr.on('data', (data) => {
    console.error(`Flask error: ${data}`);
  });
}

function stopServer() {
  if (flaskProcess) {
    flaskProcess.kill();
  }
}

module.exports = {
  startServer,
  stopServer
};
