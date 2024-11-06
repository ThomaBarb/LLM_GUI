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

    // Requesting data from the server for initialization of the content
    const net = require('net');
    PORT = 65433
    IP = '192.168.1.66'
    const client = new net.Socket();
    client.connect(PORT, IP, () => {    
        client.write('[[-INIT-]]');

    });
    client.on('error', (error) => {
        console.error('Connection error:', error); 
    });

    // Listen for data from the server
    client.on('data', (data) => {
        console.log('Received from server:', data.toString());
        mainWindow.webContents.send('init-content', data.toString());
    });

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