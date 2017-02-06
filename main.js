/*
 *
 *  iom - Image Optimization Manager (Main Process)
 *  Author: Javier Aroche
 *
 */

const {electron, ipcMain, dialog, app, BrowserWindow, globalShortcut} = require('electron')

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

attachAppListeners();

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 500, 
        height: 400,
        minWidth: 450,
        minHeight: 200,
        maxWidth: 800,
        maxHeight: 600,
        frame: true,
        center : true,
        maximizable : false,
        resizable: false,
        titleBarStyle: 'hidden-inset'
    })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function onReady(){
    createWindow()

    // Shortcuts
    // If you want to open up dev tools programmatically,
    // use the shortcut Command + Shift + X.
    globalShortcut.register('Command+Shift+X', () => {
        mainWindow.openDevTools()
    })
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

app.on('open-file', function (event, path) {
    console.log(path)
})

app.on('will-quit', () => {
    // Unregister a shortcut.
    globalShortcut.unregister('Command+Shift+X')

    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
})

function attachAppListeners() {
    // Prompt for directory path
    ipcMain.on('load-files', function(event) {
        // Get files
        dialog.showOpenDialog(mainWindow, {
            title       : 'Load files',
            buttonLabel : 'Process',
            properties  : ['openFile', 'openDirectory', 'createDirectory', 'multiSelections'] 
        }, function(files) {
            if(files) {
                event.sender.send('loaded-files', files);
            }
        });
    });
}