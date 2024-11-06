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
        ipcRenderer.send('log-message', `Connection error: ${error.message}`);
        console.error('Connection error:', error);
    });
});


document.getElementById('submit-prompt').addEventListener('click', () => {
    ipcRenderer.send("log-message", "Submitting prompt")
    const prompt = document.getElementById("prompt-textarea").value;
    ipcRenderer.send('contact-server', prompt);
});

// 
function addMessageContent_empty(message)
{
    // let results = [];
    // results.push({ "id": "system", "message": message });
    // results.push({ "id": "user", "message": message });
    // results.push({ "id": "assistant", "message": "" });
    // return results;

    ////////////////////////////////////////////////////////////////////////////////
    let results = [];
    try {
        // Regular expression to match the segments between start_header_id and eot_id
        // const regex = /<\|start_header_id\|>(.*?)<\|end_header_id\|>\s*(.*?)<\|eot_id\|>/g;
        // const regex = /<\|start_header_id\|>(.*?)<\|end_header_id\|>\s*(.*?)\s*<\|eot_id\|>/gs;
        const regex = /<\|start_header_id\|>(.*?)<\|end_header_id\|>\s*(.*?)\s*<\|eot_id\|>\s*/gs;

        let matches;

        while ((matches = regex.exec(message.toString('utf-8'))) !== null) {
            const id = matches[1];
            const message = matches[2];
            results.push({ id, message });
        }
    } catch (error) {
        ipcRenderer.send("log-message", error.message);
    }
    ////////////////////////////////////////////////////////////////////////////////
    return results

} // End function addMessageContent_empty

// 
function addMessageContent_allText(message)
{
    ipcRenderer.send('log-message', message);
    ////////////////////////////////////////////////////////////////////////////////
    let results = [];
    try {
        // Regular expression to match the segments between start_header_id and eot_id
        // const regex = /<\|start_header_id\|>(.*?)<\|end_header_id\|>\s*(.*?)<\|eot_id\|>/g;
        const regex = /<\|start_header_id\|>(.*?)<\|end_header_id\|>\s*(.*?)\s*<\|eot_id\|>/gs;

        let matches;

        while ((matches = regex.exec(message[1].toString('utf-8'))) !== null) {
            const id = matches[1];
            const message = matches[2];
            results.push({ id, message });
        }
    } catch (error) {
        ipcRenderer.send("log-message", error.message);
    }
    ////////////////////////////////////////////////////////////////////////////////
    return results

} // End function addMessageContent_allText

// 
function addMessageToFeed(message, new_msg=false)
{
    const containerDiv = document.createElement('div');
    containerDiv.className = 'message';
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    const answerDiv = document.createElement('div');
    answerDiv.className = 'answer';

    let results = [];
    if (!new_msg) 
    {
        results = addMessageContent_allText(message);
    }
    else
    {
        results = addMessageContent_empty(message);
    }
    ipcRenderer.send('log-message', "results");
    ipcRenderer.send('log-message', results);

    questionDiv.textContent = results.find(item => item.id === "user").message;
    answerDiv.textContent = results.find(item => item.id === "assistant").message;

    containerDiv.appendChild(questionDiv);
    containerDiv.appendChild(answerDiv);  
    document.getElementById('chatFeed').appendChild(containerDiv);

} // End function addMessageToFeed

ipcRenderer.on('init-content', (event, message) => {    
    message.forEach(message => {
        addMessageToFeed(message, false);
    });
});

ipcRenderer.on('new-message-to-feed', (event, message) => {    
    // addMessageToFeed(message, true);
    addMessageToFeed(message, true);
});
