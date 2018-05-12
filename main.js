/*
 *
 *  iom - Image Optimization Manager (Main Process)
 *  Author: Javier Aroche
 *
 */

const {
	ipcMain,
	dialog,
	app,
	BrowserWindow,
	globalShortcut,
	autoUpdater,
	shell
} = require('electron')
const fs = require('fs')
const path = require('path')
const os = require('os')
const url = require('url')
const https = require('https')
const semver = require('semver')

let mainWindow
let openedFiles = []
let osPlatform = os.platform()

attachAppListeners()
attachUpdaterListeners()

function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 500,
		height: 470,
		minWidth: 500,
		minHeight: 200,
		frame: true,
		center: true,
		maximizable: true,
		resizable: true,
		titleBarStyle: 'hidden-inset',
		show: false
	})

	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
		// Load files
		if(openedFiles.length > 0) {
			openedFiles.forEach(function(openedFile) {
				mainWindow.webContents.send('load-file', openedFile)
			})
			// Reset queue
			openedFiles = []
		}
	})
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}))
	checkForUpdates('autoRequested')
	mainWindow.on('focus', registerShortcuts)
	mainWindow.on('blur', unregisterShortcuts)
	mainWindow.on('closed', function() {
		mainWindow = null
	})
}

app.on('ready', () => {
	createWindow()
})

app.on('activate', () => {
	if(mainWindow === null) {
		createWindow()
	}
})

app.on('open-file', (ev, filePath) => {
	ev.preventDefault()
	var cleanFilePath = path.resolve(decodeURIComponent(filePath))
	if(mainWindow) {
		mainWindow.webContents.send('load-file', cleanFilePath)
	} else {
		openedFiles.push(cleanFilePath)
	}
})

// Listen to custom protocol incoming messages
app.on('open-url', (ev, url) => {
	ev.preventDefault()
	var cleanURL = path.resolve(decodeURIComponent(url.substring(7)))
	openedFiles.push(cleanURL)
	try {
		mainWindow.webContents.send('load-file', cleanURL)
	} catch(err) {}
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
			title: 'Load files',
			buttonLabel: 'Process',
			properties: ['openFile', 'openDirectory', 'createDirectory', 'multiSelections']
		}, function(files) {
			if(files) {
				event.sender.send('loaded-files', files)
			}
		})
	})

	// Updates
	ipcMain.on('request-update', function(event) {
		switch(osPlatform) {
			case 'darwin':
				checkForUpdates('userRequested')
				break
			case 'win32':
				// TODO: Add auto updates for windows
				break
			case 'linux':
				break
			default:
				break
		}
	})

	ipcMain.on('request-localStoragePath', function(event) {
		var localStoragePath = getLocalStoragePath()
		event.sender.send('send-localStoragePath', localStoragePath)
	})

	ipcMain.on('open-quick-look', function(event, path) {
		mainWindow.previewFile(path)
	})

	ipcMain.on('close-quick-look', function(event, path) {
		mainWindow.closeFilePreview()
	})
}

function registerShortcuts() {
	globalShortcut.register('Command+Shift+X', () => {
		mainWindow.openDevTools()
	})
	globalShortcut.register('Space', () => {
		mainWindow.webContents.send('quick-look')
	})
	globalShortcut.register('Backspace', () => {
		mainWindow.webContents.send('delete-file')
	})
};

function unregisterShortcuts() {
	globalShortcut.unregisterAll()
};

// Update App Helpers
function checkForUpdates(arg) {
	var feedURL = getFeedUrl()
	if(!feedURL) {
		return false
	}

	https.get(feedURL, (res) => {
		var body = ''

		res.on('data', function(chunk) {
			body += chunk
		})

		res.on('end', function(chunk) {
			var feed = JSON.parse(body)

			if(semver.cmp(app.getVersion(), '<', feed.version)) {
				updateVersion()
				if(arg === 'userRequested') {
					dialog.showMessageBox({
						type: 'info',
						message: 'New release available!',
						detail: 'Downloading and updating iom...',
						buttons: ['OK']
					})
				}
				return true
			} else {
				if(arg === 'userRequested') {
					dialog.showMessageBox({
						type: 'info',
						message: 'You are up to date!',
						detail: 'iom v' + app.getVersion() + ' is the latest version.',
						buttons: ['OK', 'More Info']
					}, function(option) {
						if(option === 1) {
							shell.openExternal('https://github.com/JavierAroche/iom')
						}
					})
				}
			}
		})
	}).on('error', (err) => {
		console.log('Error getting the update feed: ', err)
	})
}

// Update event listeners
function attachUpdaterListeners() {
	autoUpdater.on('update-available', function(update) {
		mainWindow.webContents.send('console-on-renderer', 'update-available: ' + JSON.stringify(update))
	})

	autoUpdater.on('checking-for-update', function(update) {
		mainWindow.webContents.send('console-on-renderer', 'checking-for-update: ' + JSON.stringify(update))

		// Disable check for updates item
		mainWindow.webContents.send('toggle-checkForUpdatesMenuItem', false)
	})

	autoUpdater.on('update-downloaded', function(event, url, version, notes, pubDate, quitAndUpdate) {
		mainWindow.webContents.send('console-on-renderer', 'update-downloaded: ')

		dialog.showMessageBox({
			message: 'New release available!',
			detail: 'Please update iom to the latest version.',
			buttons: ['Install and Relaunch']
		}, function(buttonIndex) {
			if(buttonIndex === 0) {
				autoUpdater.quitAndInstall()
			}
		})

		// Enable check for updates item
		mainWindow.webContents.send('toggle-checkForUpdatesMenuItem', true)
	})

	autoUpdater.on('update-not-available', function(a) {
		mainWindow.webContents.send('console-on-renderer', 'Update not available' + a)
	})

	autoUpdater.on('error', function(a, b) {
		mainWindow.webContents.send('console-on-renderer', 'autoUpdate error: ' + JSON.stringify(a) + ' ' + JSON.stringify(b))
	})
}

function updateVersion() {
	autoUpdater.setFeedURL(getFeedUrl())
	autoUpdater.checkForUpdates()
	mainWindow.webContents.send('console-on-renderer', 'Trying to update app...')
}

function getFeedUrl() {
	switch(osPlatform) {
		case 'darwin':
			return 'https://raw.githubusercontent.com/JavierAroche/iom/master/releases/releases-darwin.json'
		case 'win32':
			return 'https://raw.githubusercontent.com/JavierAroche/iom/master/releases/releases-win32.json'
		case 'linux':
		default:
			return false
	}
}

function getLocalStoragePath() {
	return app.getPath('userData')
}
