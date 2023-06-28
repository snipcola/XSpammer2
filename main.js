const { app, BrowserWindow: Window } = require('electron');
const path = require('path');

const serve = require('electron-serve');
const loadURL = serve({ directory: 'public' });

let window;

function isDev () {
    return !app.isPackaged;
};

function createWindow () {
    window = new Window({
        width: 750,
        height: 450,
        webPreferences: {
            nodeIntegration: true
        },
        icon: path.join(__dirname, 'public/favicon.png'),
        show: false
    });

    if (isDev()) window.loadURL('http://localhost:8080')
    else loadURL(window);

    window.on('closed', function () {
        window = null;
    });

    window.once('ready-to-show', function () {
        window.show();
    });
};

app.on('ready', function () {
    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (window === null) createWindow();
});