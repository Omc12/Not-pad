const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const axios = require('axios'); // Ensure axios is added to dependencies

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false // Note: Disabling webSecurity can have security implications
        },
        autoHideMenuBar: true
    });

    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
    mainWindow.setMenuBarVisibility(false);
}

app.on('ready', createWindow);

ipcMain.on('open-python-browser', () => {
    const pythonScript = path.join(__dirname, 'browser', 'main.py');
    exec(`python3 "${pythonScript}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error}`);
            return;
        }
        console.log(`Python script output: ${stdout}`);
        if (stderr) {
            console.error(`Python script stderr: ${stderr}`);
        }
    });
});

ipcMain.on('start-voice-recognition', (event) => {
    const pythonScript = path.join(__dirname, 'voice_recognition', 'voiceRecognition.py');
    exec(`python3 "${pythonScript}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error}`);
            event.reply('voice-recognition-error', error.message);
            return;
        }
        console.log(`Python script output: ${stdout}`);
        event.reply('voice-recognition-result', stdout.trim());
        if (stderr) {
            console.error(`Python script stderr: ${stderr}`);
        }
    });
});

ipcMain.on('open-file-dialog', (event) => {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Text Files', extensions: ['txt'] }]
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            const filePath = result.filePaths[0];
            axios.post('http://localhost:5000/open-file', { filePath })
                .then(response => {
                    const { success, content, error } = response.data;
                    if (success) {
                        event.sender.send('file-opened', filePath, content);
                    } else {
                        console.error(`Error opening file: ${error}`);
                    }
                })
                .catch(error => {
                    console.error('Error opening file:', error);
                });
        }
    }).catch(err => {
        console.error(`Error opening file dialog: ${err}`);
    });
});

ipcMain.on('save-file', (event, filePath, content) => {
    axios.post('http://localhost:5000/save-file', { filePath, content })
        .then(response => {
            const { success, error } = response.data;
            if (success) {
                event.reply('file-saved', filePath);
            } else {
                event.reply('save-file-error', error);
            }
        })
        .catch(error => {
            console.error('Error saving file:', error);
            event.reply('save-file-error', error.message);
        });
});

ipcMain.on('create-tab', (event, tabId, title, content) => {
    axios.post('http://localhost:5000/create-tab', { tabId, title, content })
        .then(response => {
            const { success } = response.data;
            if (success) {
                event.reply('tab-created', tabId, title, content);
            } else {
                console.error('Error creating tab:', response.data.error);
            }
        })
        .catch(error => {
            console.error('Error creating tab:', error);
        });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (!mainWindow) {
        createWindow();
    }
});
