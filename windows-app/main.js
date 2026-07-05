const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');

// Register custom protocol to handle Next.js absolute paths correctly offline
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Happy Birthday, My Love | A Digital Love Scrapbook",
    icon: path.join(__dirname, '..', 'android-app', 'app', 'src', 'main', 'res', 'mipmap-xxxhdpi', 'ic_launcher.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the root index file using our custom protocol
  mainWindow.loadURL('app://./index.html');

  // Disable default browser menu bar
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Intercept the custom 'app' protocol to serve files locally
  protocol.registerFileProtocol('app', (request, callback) => {
    let url = request.url.substring(6); // strip 'app://'
    
    // Strip query parameters and hash fragments (e.g., app://./index.html?ts=123 -> app://./index.html)
    url = url.split('?')[0].split('#')[0];
    
    // Normalize relative paths (e.g., ./_next/... -> _next/...)
    if (url.startsWith('./')) {
      url = url.substring(2);
    }
    
    // Default to index.html for root page path
    if (!url || url === '/') {
      url = 'index.html';
    }
    
    // Next.js static page transitions (e.g. /timeline -> timeline.html)
    if (!url.includes('.') && !url.endsWith('/')) {
      url = `${url}.html`;
    }

    const filePath = path.normalize(path.join(__dirname, 'out', url));
    callback({ path: filePath });
  });

  createWindow();
});

// Quit when all windows are closed, except on macOS (standard lifecycle)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
