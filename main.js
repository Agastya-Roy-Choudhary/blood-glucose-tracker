const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    // Create the browser window
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, './assets/logo.ico'),
        title: 'GlucoLink',
        frame: true
    });

    // Load app-home.html by default
    mainWindow.loadFile('app-home.html');

    // Handle navigation to prevent index.html from loading
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (url.endsWith('index.html')) {
            event.preventDefault();
            mainWindow.loadFile('app-home.html');
        }
    });

    // Handle new window creation to prevent index.html from opening
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.endsWith('index.html')) {
            mainWindow.loadFile('app-home.html');
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });
}

// When Electron has finished initialization
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
}); 