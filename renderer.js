const { ipcRenderer } = require('electron');

let isExtended = false;  // Track the window state

document.getElementById('toggle-button').addEventListener('click', () => {
    isExtended = !isExtended;  // Toggle state
    ipcRenderer.send('toggle-window-size', isExtended);  // Send message to main process

    ipcRenderer.send('log-message', 'Button clicked!'); 
    // Update button text
    document.getElementById('toggle-button').textContent = isExtended ? 'Fold' : 'Extend';
});

document.getElementById('ping-server').addEventListener('click', () => {
    const net = require('net');
    PORT = 65432
    IP = '192.168.1.66'
    const client = new net.Socket();
    ipcRenderer.send('log-message', 'Trying to connect !'); 
    client.connect(PORT, IP, () => {    
        ipcRenderer.send('log-message', 'Connected !'); 
        client.write('Hello from JavaScript client!');
    });
    // Error handling
    client.on('error', (error) => {
        ipcRenderer.send('log-message', `Connection error: ${error.message}`); // Send error message to main process
        console.error('Connection error:', error); // Log error to the console (renderer)
    });
});
