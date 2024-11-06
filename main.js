const { app, BrowserWindow, ipcMain } = require('electron');
let mainWindow;
let socket;
const net = require('net');
PORT = 65433
IP = '192.168.1.66'
const client = new net.Socket();

// Create a single WebSocket connection in the main process
function createSocketConnection() {
    client.connect(PORT, IP, () => { 
        console.log("Connected to server.")
    }   )
  
    // client.on('message', (message) => {
    //   // Relay messages to renderer when received
    //   if (mainWindow) {
    //     mainWindow.webContents.send('socket-message', message);
    //   }
    // });
  
    client.on('close', () => {
      console.log('WebSocket closed');
    });
}

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

    createSocketConnection()

    // Requesting data from the server for initialization of the content
    client.write('[[-INIT-]]');
    client.on('data', (data) => {
        const parsedMessage = JSON.parse(data);
        console.log('Received from server:', data.toString('utf-8'));
        switch (parsedMessage.type.toString('utf-8')) {
            case 'init':
                console.log("INIT !!!");
                mainWindow.webContents.send('init-content', parsedMessage.content);
                break;
            // End case init

            case 'answer':
                console.log("Creating new message");
                mainWindow.webContents.send('new-message-to-feed', parsedMessage.content);
                break;
            // End case answer

        } // End switch
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

ipcMain.on('contact-server', (event, message) => {
    console.log('Sending to server:', message);
    client.write(message)
});