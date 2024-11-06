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
    PORT = 65433
    IP = '192.168.1.66'
    const client = new net.Socket();
    ipcRenderer.send('log-message', 'Trying to connect !'); 
    client.connect(PORT, IP, () => {    
        ipcRenderer.send('log-message', 'Connected !'); 
        client.write('Hello from JavaScript client!');
    });
    // Error handling
    client.on('error', (error) => {
        ipcRenderer.send('log-message', `Connection error: ${error.message}`);
        console.error('Connection error:', error);
    });
});


document.getElementById('submit-prompt').addEventListener('click', () => {
    const net = require('net');
    PORT = 65433
    IP = '192.168.1.66'
    const client = new net.Socket();
    ipcRenderer.send('log-message', 'Trying to connect !'); 
    client.connect(PORT, IP, () => {    
        ipcRenderer.send('log-message', 'Connected !'); 
        const prompt = document.getElementById("prompt-textarea").value;
        ipcRenderer.send('log-message', prompt);
        client.write(prompt);
    });
    // Error handling
    client.on('error', (error) => {
        ipcRenderer.send('log-message', `Connection error: ${error.message}`);
        console.error('Connection error:', error);
    });
});


ipcRenderer.on('init-content', (event, message) => {
    const jsonData = JSON.parse(message.toString('utf-8'));
    // ipcRenderer.send('log-message', `Message from server: ${jsonData}`);

    
    jsonData.forEach(message => {
        // ipcRenderer.send('log-message', message[1]);
        const containerDiv = document.createElement('div');
        containerDiv.className = 'message';
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        const answerDiv = document.createElement('div');
        answerDiv.className = 'answer';

        ////////////////////////////////////////////////////////////////////////////////
        const results = [];
        try {
            // Regular expression to match the segments between start_header_id and eot_id
            const regex = /<\|start_header_id\|>(.*?)<\|end_header_id\|>\s*(.*?)<\|eot_id\|>/g;

            let matches;

            while ((matches = regex.exec(message[1])) !== null) {
                const id = matches[1];
                const message = matches[2];
                results.push({ id, message });
            }
            // ipcRenderer.send('log-message', results.find(item => item.id === "user"));
        } catch (error) {
            ipcRenderer.send("log-message", error.message);
        }
        ////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////

        questionDiv.textContent = results.find(item => item.id === "user").message;
        answerDiv.textContent = results.find(item => item.id === "assistant").message;

        containerDiv.appendChild(questionDiv);
        containerDiv.appendChild(answerDiv);  
        document.getElementById('chatFeed').appendChild(containerDiv);
    });
});
