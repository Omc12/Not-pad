const { ipcRenderer } = require('electron');
const path = require('path');

let tabCount = 1;
let currentTabId = 'tab1';
let currentFile = null;

function openBrowserTab() {
    ipcRenderer.send('open-python-browser');
}

function openDictationWindow() {
    ipcRenderer.send('start-voice-recognition');
}

function about() {
    alert('Not-pad\nVersion 0.0.5(early access)\nCreated By NotML.');
}

function createWebViewTab(url) {
    const newTabId = `tab${tabCount}`;
    tabCount++;

    // Create tab button
    const tabButton = document.createElement("button");
    tabButton.className = "tab";
    tabButton.textContent = `Browser ${tabCount}`;
    tabButton.onclick = (event) => openTab(event, newTabId);

    const addTabButton = document.querySelector(".add-tab");
    addTabButton.parentNode.insertBefore(tabButton, addTabButton);

    // Create tab content with web view
    const newTabContent = document.createElement("div");
    newTabContent.id = newTabId;
    newTabContent.className = "tab-content";

    const webView = document.createElement("webview");
    webView.setAttribute('src', url);
    webView.setAttribute('style', 'width: 100%; height: 100%; border: none;');

    newTabContent.appendChild(webView);

    document.querySelector(".notepad").appendChild(newTabContent);

    openTab({ currentTarget: tabButton }, newTabId);
}

function openTab(evt, tabId) {
    currentTabId = tabId;
    const tabContent = document.querySelectorAll(".tab-content");
    tabContent.forEach(tab => tab.classList.remove("active"));

    const tabLinks = document.querySelectorAll(".tab");
    tabLinks.forEach(tab => tab.classList.remove("active"));

    document.getElementById(tabId).classList.add("active");
    evt.currentTarget.classList.add("active");
}

function addTab() {
    tabCount++;
    const newTabId = `tab${tabCount}`;
    createTab(newTabId, `Untitled ${tabCount}`, '');
}

function createTab(tabId, title, content) {
    const tabButton = document.createElement("button");
    tabButton.className = "tab";
    tabButton.textContent = title;
    tabButton.onclick = (event) => openTab(event, tabId);

    const addTabButton = document.querySelector(".add-tab");
    addTabButton.parentNode.insertBefore(tabButton, addTabButton);

    const newTabContent = document.createElement("div");
    newTabContent.id = tabId;
    newTabContent.className = "tab-content";

    const textarea = document.createElement("textarea");
    textarea.value = content;
    textarea.setAttribute("oninput", "updateStatusBar(this)");

    const statusBar = document.createElement("div");
    statusBar.className = "status-bar";
    statusBar.textContent = "Ln 1, Col 1";

    newTabContent.appendChild(textarea);
    newTabContent.appendChild(statusBar);

    document.querySelector(".notepad").appendChild(newTabContent);

    openTab({ currentTarget: tabButton }, tabId);
}

function updateStatusBar(textarea) {
    const statusBar = textarea.parentElement.querySelector('.status-bar');

    const lines = textarea.value.substr(0, textarea.selectionStart).split("\n");
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;

    statusBar.textContent = `Ln ${line}, Col ${col}`;
}

function newFile() {
    addTab();
}

function openFileContent(filePath, content) {
    if (fileExists(filePath)) {
        addTab();
        const activeTab = document.querySelector(`#${currentTabId}`);
        activeTab.querySelector('textarea').value = content;
        currentFile = filePath;
    }
}

function saveFile() {
    if (currentFile) {
        ipcRenderer.send('save-file', currentFile, getActiveFileContent());
    } else {
        saveFileAs();
    }
}

function saveFileAs() {
    ipcRenderer.send('save-file-dialog');
}

function saveFileContent(filePath, content) {
    if (filePath) {
        ipcRenderer.send('save-file', filePath, content);
    }
}

function handleFileOpen(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        openFileContent(file.path, content);
    };
    reader.readAsText(file);
}

function getActiveFileContent() {
    const activeTab = document.querySelector(`#${currentTabId}`);
    return activeTab.querySelector('textarea').value;
}

function savePreferences() {
    const fontSize = document.getElementById('fontSize').value;
    const tabWidth = document.getElementById('tabWidth').value;

    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.style.fontSize = fontSize + 'px';
        textarea.style.tabSize = tabWidth;
    });

    closePreferencesModal();
}

function showPreferencesModal() {
    document.getElementById('preferencesModal').style.display = 'block';
}

function closePreferencesModal() {
    document.getElementById('preferencesModal').style.display = 'none';
}

function showFindReplaceModal() {
    document.getElementById('findReplaceModal').style.display = 'block';
}

function closeFindReplaceModal() {
    document.getElementById('findReplaceModal').style.display = 'none';
}

function findNext() {
    const findText = document.getElementById('findText').value;
    const caseSensitive = document.getElementById('caseSensitive').checked;
    const regexSearch = document.getElementById('regexSearch').checked;

    const activeTab = document.querySelector(`#${currentTabId}`);
    const textarea = activeTab.querySelector('textarea');
    const content = textarea.value;

    const flags = caseSensitive ? 'g' : 'gi';
    const regex = regexSearch ? new RegExp(findText, flags) : new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    const match = regex.exec(content.substring(textarea.selectionEnd));
    if (match) {
        textarea.setSelectionRange(textarea.selectionEnd + match.index, textarea.selectionEnd + match.index + match[0].length);
    } else {
        alert('No more matches found.');
    }
}

function replaceNext() {
    const findText = document.getElementById('findText').value;
    const replaceText = document.getElementById('replaceText').value;
    const caseSensitive = document.getElementById('caseSensitive').checked;
    const regexSearch = document.getElementById('regexSearch').checked;

    const activeTab = document.querySelector(`#${currentTabId}`);
    const textarea = activeTab.querySelector('textarea');
    const content = textarea.value;

    const flags = caseSensitive ? 'g' : 'gi';
    const regex = regexSearch ? new RegExp(findText, flags) : new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    const match = regex.exec(content.substring(textarea.selectionEnd));
    if (match) {
        const start = textarea.selectionEnd + match.index;
        const end = textarea.selectionEnd + match.index + match[0].length;
        textarea.setSelectionRange(start, end);
        document.execCommand('insertText', false, replaceText);
    } else {
        alert('No more matches found.');
    }
}

function replaceAll() {
    const findText = document.getElementById('findText').value;
    const replaceText = document.getElementById('replaceText').value;
    const caseSensitive = document.getElementById('caseSensitive').checked;
    const regexSearch = document.getElementById('regexSearch').checked;

    const activeTab = document.querySelector(`#${currentTabId}`);
    const textarea = activeTab.querySelector('textarea');
    const content = textarea.value;

    const flags = caseSensitive ? 'g' : 'gi';
    const regex = regexSearch ? new RegExp(findText, flags) : new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    const newContent = content.replace(regex, replaceText);

    textarea.value = newContent;
}

ipcRenderer.on('file-opened', (event, filePath, content) => {
    openFileContent(filePath, content);
});

ipcRenderer.on('file-saved', (event, filePath) => {
    console.log(`File saved successfully: ${filePath}`);
});

ipcRenderer.on('save-file-error', (event, error) => {
    console.error(`Error saving file: ${error}`);
});

ipcRenderer.on('tab-created', (event, tabId, title, content) => {
    createTab(tabId, title, content);
});

ipcRenderer.on('about-notepad', () => {
    about();
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('openBrowserButton').addEventListener('click', openBrowserTab);
    document.getElementById('openDictationWindowButton').addEventListener('click', openDictationWindow);
});
