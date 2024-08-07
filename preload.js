const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // IPC Renderer to send messages to main process
    ipcRenderer: {
        send: (channel, data) => {
            ipcRenderer.send(channel, data);
        },
        on: (channel, listener) => {
            ipcRenderer.on(channel, (event, ...args) => listener(...args));
        },
        once: (channel, listener) => {
            ipcRenderer.once(channel, (event, ...args) => listener(...args));
        },
        removeListener: (channel, listener) => {
            ipcRenderer.removeListener(channel, listener);
        }
    }
});
