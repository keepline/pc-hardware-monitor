const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const si = require('systeminformation');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#000000',
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  mainWindow.loadFile('index.html');
  
  // 开发模式下打开DevTools
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// IPC handlers for hardware info
ipcMain.handle('get-cpu-info', async () => {
  const cpu = await si.cpu();
  const cpuLoad = await si.currentLoad();
  const cpuTemp = await si.cpuTemperature();
  return { cpu, cpuLoad, cpuTemp };
});

ipcMain.handle('get-memory-info', async () => {
  const mem = await si.mem();
  const memLayout = await si.memLayout();
  return { mem, memLayout };
});

ipcMain.handle('get-disk-info', async () => {
  const diskLayout = await si.diskLayout();
  const fsSize = await si.fsSize();
  return { diskLayout, fsSize };
});

ipcMain.handle('get-gpu-info', async () => {
  return await si.graphics();
});

ipcMain.handle('get-network-info', async () => {
  const networkInterfaces = await si.networkInterfaces();
  const networkStats = await si.networkStats();
  return { networkInterfaces, networkStats };
});

ipcMain.handle('get-system-info', async () => {
  const system = await si.system();
  const bios = await si.bios();
  const baseboard = await si.baseboard();
  const osInfo = await si.osInfo();
  return { system, bios, baseboard, osInfo };
});

ipcMain.handle('get-battery-info', async () => {
  return await si.battery();
});

ipcMain.handle('get-all-info', async () => {
  try {
    const [cpu, cpuLoad, cpuTemp, memory, disk, gpu, network, system, battery] = await Promise.all([
      si.cpu(),
      si.currentLoad(),
      si.cpuTemperature(),
      si.mem().then(async (mem) => {
        const memLayout = await si.memLayout();
        return { mem, memLayout };
      }),
      si.diskLayout().then(async (layout) => {
        const fsSize = await si.fsSize();
        return { diskLayout: layout, fsSize };
      }),
      si.graphics(),
      si.networkInterfaces().then(async (interfaces) => {
        const stats = await si.networkStats();
        return { networkInterfaces: interfaces, networkStats: stats };
      }),
      si.system().then(async (sys) => {
        const bios = await si.bios();
        const baseboard = await si.baseboard();
        const osInfo = await si.osInfo();
        return { system: sys, bios, baseboard, osInfo };
      }),
      si.battery()
    ]);

    return {
      cpu: { cpu, cpuLoad, cpuTemp },
      memory,
      disk,
      gpu,
      network,
      system,
      battery
    };
  } catch (error) {
    console.error('Error fetching system info:', error);
    return null;
  }
});

