const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
require('dotenv').config({ debug: false, override: false });

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload_minimal.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false,
            sandbox: false,  // Disable sandbox to allow module loading
            devTools: process.env.NODE_ENV === 'development'  // Enable devTools only in development
        },
        icon: path.join(__dirname, 'renderer', 'images.png'),
        autoHideMenuBar: true,  // Hide menu bar by default
        menuBarVisible: false,  // Ensure menu bar is not visible
        frame: true,           // Keep window frame but without menu
        titleBarStyle: 'default'
    });

    // Remove the default menu completely
    Menu.setApplicationMenu(null);

    win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

    // Disable developer tools and debugging features in production
    if (process.env.NODE_ENV !== 'development') {
        win.webContents.on('before-input-event', (event, input) => {
            // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (view source)
            if (
                input.key === 'F12' ||
                (input.control && input.shift && input.key === 'I') ||
                (input.control && input.shift && input.key === 'J') ||
                (input.control && input.key === 'U')
            ) {
                event.preventDefault();
            }
        });
    }

    // Disable right-click context menu
    win.webContents.on('context-menu', (event) => {
        event.preventDefault();
    });

    // Prevent new window creation
    win.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    // Only open DevTools in development (never in production)
    if (process.env.NODE_ENV === 'development') {
        // DevTools are still disabled even in development for security
        // win.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    createWindow();

    // Disable all menu shortcuts globally
    app.on('browser-window-created', (event, window) => {
        window.webContents.on('before-input-event', (event, input) => {
            // Block all developer tool shortcuts
            const blockedKeys = [
                'F12',
                'F11', // Fullscreen
                'F5',  // Refresh
                'CommandOrControl+R', // Refresh
                'CommandOrControl+Shift+R', // Hard refresh
                'CommandOrControl+Shift+I', // DevTools
                'CommandOrControl+Shift+J', // Console
                'CommandOrControl+Shift+C', // Element inspector
                'CommandOrControl+U', // View source
                'CommandOrControl+Shift+Delete', // Clear data
                'CommandOrControl+H', // History
                'CommandOrControl+J', // Downloads
                'CommandOrControl+Shift+Delete' // Clear browsing data
            ];

            const keyCombo = input.control ? 'CommandOrControl+' : '';
            const shiftCombo = input.shift ? 'Shift+' : '';
            const fullKey = keyCombo + shiftCombo + input.key;

            if (blockedKeys.includes(input.key) || blockedKeys.includes(fullKey)) {
                event.preventDefault();
            }
        });
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Prevent any external navigation or protocol handling
app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        // Only allow navigation to local files
        if (parsedUrl.protocol !== 'file:') {
            event.preventDefault();
        }
    });

    contents.on('will-attach-webview', (event, webPreferences, params) => {
        // Prevent webview attachment
        event.preventDefault();
    });

    contents.on('new-window', (event, navigationUrl) => {
        // Prevent new windows
        event.preventDefault();
    });
});
