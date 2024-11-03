const { app, BrowserWindow, ipcMain } = require('electron');
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,          // Initial width
        height: 300,         // Initial height (compact view)
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('index.html'); // Load the HTML for your chat interface
}

app.whenReady().then(createWindow);

// Listen for resize requests from the renderer process
ipcMain.on('toggle-window-size', (event, isExtended) => {
    if (isExtended) {
        mainWindow.setSize(600, 500);  // Extend to larger size
    } else {
        mainWindow.setSize(400, 300);  // Collapse to smaller size
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


ipcMain.on('log-message', (event, message) => {
    console.log('Received from renderer:', message);
});