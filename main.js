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
        // Only set icon if it exists
        ...(require('fs').existsSync(path.join(__dirname, 'assets/icon.png')) && {
            icon: path.join(__dirname, 'assets/icon.png')
        }),
        title: 'GlucoTrack',
        frame: true // Use native window frame
    });

    // Load the index.html file
    mainWindow.loadFile('index.html');

    // Open DevTools in development
    // mainWindow.webContents.openDevTools();
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