/*
 *
 *  iom - Image Optimization Manager (Main Process)
 *  Author: Javier Aroche
 *
 */

const { electron, ipcMain, dialog, app, BrowserWindow, globalShortcut, autoUpdater } = require('electron')

const path = require('path')
const url = require('url')
const https = require ('https')
const semver = require('semver')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

attachAppListeners();
attachUpdaterListeners();

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 500, 
        height: 400,
        minWidth: 500,
        minHeight: 200,
        frame: true,
        center : true,
        maximizable : true,
        resizable: true,
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

app.on('window-all-closed', () => {
	globalShortcut.unregisterAll()
	app.quit()
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
	
	// Updates
    ipcMain.on('request-update', function(event) {
        checkForUpdates('userRequested');
    });
}

// Update App Helpers
function checkForUpdates(arg) {
    https.get(getFeedUrl(), (res) => {
        var body = '';

        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(chunk) {
            var feed = JSON.parse(body);

            if ( semver.cmp(app.getVersion(), '<', feed.version) ) {
				if( arg == 'userRequested' ) {
					updateVersion();
					dialog.showMessageBox({ message: 'New release available!', detail: 'Downloading and updating Kandinsky...', buttons: ['OK'] });	
				}
                return true;
            } else {
                if( arg == 'userRequested' ) {
                    dialog.showMessageBox({ message: 'You are up to date!', detail: 'Kandinsky v' + app.getVersion() + ' is the latest version.', buttons: ['OK'] }); 
                }
            }
        });

    }).on('error', (err) => {
          console.log('Error getting the update feed: ', err);
    });
}

// Update event listeners
function attachUpdaterListeners() {
    autoUpdater.on('update-available', function(update) {
        mainWindow.webContents.send('console-on-renderer', 'update-available: ' + JSON.stringify(update));
    });

    autoUpdater.on('checking-for-update', function(update) {
        mainWindow.webContents.send('console-on-renderer', 'checking-for-update: ' + JSON.stringify(update));

        // Disable check for updates item
        mainWindow.webContents.send('toggle-checkForUpdatesMenuItem', false);
    });

    autoUpdater.on('update-downloaded', function(event, url, version, notes, pub_date, quitAndUpdate) {
        mainWindow.webContents.send('console-on-renderer', 'update-downloaded: ');

         dialog.showMessageBox({ message: 'New release available!', detail: 'Please update Kandinsky to the latest version.', buttons: ['Install and Relaunch'] }, function(buttonIndex) {
            if(buttonIndex == 0) {
                autoUpdater.quitAndInstall();
            }
        });

        // Enable check for updates item
        mainWindow.webContents.send('toggle-checkForUpdatesMenuItem', true);
    });

    autoUpdater.on('update-not-available', function(a) {
        mainWindow.webContents.send('console-on-renderer', 'Update not available' + a);
    });

    autoUpdater.on('error', function(a, b) {
        mainWindow.webContents.send('console-on-renderer', 'autoUpdate error: ' + JSON.stringify(a) + ' ' + JSON.stringify(b));
    });
}

function updateVersion() {
    autoUpdater.setFeedUrl( getFeedUrl() );
    autoUpdater.checkForUpdates();

    mainWindow.webContents.send('console-on-renderer', 'Trying to update app...');
}

function getFeedUrl() {
    return 'https://raw.githubusercontent.com/JavierAroche/iom/master/releases/releases.json';
}