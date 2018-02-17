/*
 *
 *  iom - Image Optimization Manager (Renderer Process)
 *  Author: Javier Aroche
 *
 */

;(function(window) {
	'use strict'

	const fs = require('fs')
	const path = require('path')
	const {
		ipcRenderer,
		shell
	} = require('electron')
	const imagemin = require('imagemin')
	const MainMenu = require('./app/MainMenu')
	const ImageminSettings = require('./app/ImageminSettings')
	window.ko = require('knockout')

	function iom() {
		this.localStorageSettingsPath = ko.observable()
		this.localStoragePresetsPath = ko.observable()
		this.mainMenu = new MainMenu(this)
		this.animOverlay = document.getElementsByClassName('animOverlay')[0]
		this.settingsOverlay = document.getElementsByClassName('settingsOverlay')[0]
		this.lockedSettings = ko.observable(true)
		this.enabledSettingsOverlay = ko.observable(false)
		this.imageminSettings = new ImageminSettings(this).plugins
    this.selectAllButton = ko.observable(true)
    this.selectAllButtonText = ko.computed(function() {
      return this.selectAllButton() ? 'Select All' : 'Deselect All'
    }, this)
		this.includeSubfolders = ko.observable(false)
		this.saveInSubFolder = ko.observable(true)
		this.quickLook = ko.observable(false)
		this.selectedFile = ko.observable()
		this.mbDecimals = 2
		this.percentageDecimals = 1
		this.files = ko.observableArray()
		this.totalPercentageSavings = ko.observable('0.0%')
		this.totalSavings = ko.computed(function() {
			var initialBytes = 0
			var finalBytes = 0
			var savedBytes = 0
			var savedTotal = '0 kb'
			var percentageSaved = '0.0%'

			this.files().forEach(function(file) {
				if(file.status() === 'success') {
					initialBytes = initialBytes + file.initialFileSize()
					finalBytes = finalBytes + file.finalFileSize()
				}
			})

			savedBytes = initialBytes - finalBytes

			if(savedBytes > 0) {
				savedTotal = this._getFinalFileSize(savedBytes)
				percentageSaved = (100 - ((finalBytes * 100) / initialBytes)).toFixed(this.percentageDecimals) + '%'
			}

			this.totalPercentageSavings(percentageSaved)
			return savedTotal
		}, this)
		this.acceptableFileTypes = ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG', 'svg', 'SVG', 'gif', 'GIF']
		this.newPresetName = ko.observable()
		this.presets = ko.observableArray([{
			name: 'Default...',
			settings: {
				imagemin: ko.toJSON(this.imageminSettings),
				includeSubfolders: this.includeSubfolders(),
				saveInSubFolder: this.saveInSubFolder()
			}
		}], this)
		this.selectedPresetValue = ko.observable('Default...')
		this.selectedPreset = ko.computed(function() {
			var selectedPresetValue = this.selectedPresetValue()
			var selectedPreset = this.presets()[0]
			this.presets().forEach(function(preset) {
				if(preset.name === selectedPresetValue) {
					selectedPreset = preset
				}
			})
			return selectedPreset
		}, this)

		// Settings menu item
		this.mainMenu.settingsMenuItem.checked = this.enabledSettingsOverlay()
		this.mainMenu.lockSettingsMenuItem.checked = this.lockedSettings()
		this._init()
	};

	iom.prototype._init = function() {
		this._setPlaceholderListeners()
		this._attachAppListeners()
		ipcRenderer.send('request-localStoragePath')
	}

	iom.prototype._setPlaceholderListeners = function() {
		var self = this

		// Drag over event for the drop area
		document.addEventListener('dragover', function(event) {
			event.preventDefault()
			if(!self.enabledSettingsOverlay()) {
				self.animOverlay.classList.add('dragged-over')
			}

			return false
		}, false)

		// Drop event for the drop area
		document.addEventListener('drop', function(event) {
			event.preventDefault()
			if(!self.enabledSettingsOverlay()) {
				var files = event.dataTransfer.files
				self.addFilesToList(files, true)
				self.animOverlay.classList.remove('dragged-over')
			}

			return false
		}, false)

		// Drag leave the drop area
		document.addEventListener('dragleave', function(event) {
			event.preventDefault()
			self.animOverlay.classList.remove('dragged-over')
			return false
		}, false)
	}

	iom.prototype.addFilesToList = function(files, mainFolder) {
		for(var i = 0; i < files.length; i++) {
			var fileStats = fs.statSync(files[i].path)
			if(fileStats.isDirectory()) {
				var filesInFolder = this._getFolderContents(files[i].path)
				if(this.includeSubfolders() || mainFolder) {
					this.addFilesToList(filesInFolder, false)
				}
			} else {
				this._addFileToList(files[i])
			}
		}
	}

	iom.prototype._addFileToList = function(file) {
		var pathProperties = path.parse(file.path)
		var name = pathProperties.base
		var parentFolder = pathProperties.dir
		var filePath = file.path
		var fileSize = file.size
		var fileType = pathProperties.ext.replace('.', '')
		var index = this.files().length

		if(this.acceptableFileTypes.indexOf(fileType) !== -1) {
			this.files.push({
				name: ko.observable(name),
				initialFileSize: ko.observable(fileSize),
				finalFileSize: ko.observable(),
				fileSavings: ko.observable(),
				selected: ko.observable(false),
				status: ko.observable('processing'),
				parentFolder: parentFolder,
				filePath: filePath,
				fileType: fileType,
				index: index
			})

			this._compressImageFile(this.files()[index])
		}
	}

	iom.prototype._getFolderContents = function(folder) {
		var self = this
		var filesInFolder = fs.readdirSync(folder)
		var files = []

		filesInFolder.forEach(function(file) {
			var filePath = path.resolve(folder, file)
			files.unshift({
				path: filePath,
				size: self._getFileSize(filePath)
			})
		})

		return files
	}

	iom.prototype.openContainingFolder = function(filePath) {
		shell.showItemInFolder(filePath)
	}

	iom.prototype.selectFile = function(model, data) {
		model.deselectAllFiles()
		data.selected(true)
		model.selectedFile(data)
	}

	iom.prototype.deselectAllFiles = function() {
		this.files().forEach(function(file) {
			file.selected(false)
		})
	}

	iom.prototype.deleteFile = function() {
		this.files.remove(this.selectedFile())
	}

	/*
	 * @private
	 * Handler function to compress an image file with imagemin
	 * @param {Object}
	 */
	iom.prototype._compressImageFile = function(file) {
		var self = this
		var fileType = file.fileType.toUpperCase()
		var userImageminSettings = this._getImageminSettings()
		var outputFolder

		if(this.saveInSubFolder()) {
			outputFolder = file.parentFolder + '/_exports'
		} else {
			outputFolder = file.parentFolder
		}

		imagemin([file.filePath], outputFolder, {
			plugins: [userImageminSettings[fileType].plugin(userImageminSettings[fileType].options)]
		}).then(files => {
			var compressedFile = files[0]
			var finalFileSize = self._getFileSize(compressedFile.path)
			self.files()[file.index].finalFileSize(finalFileSize)
			var fileSavings = self._getFileSavings(self.files()[file.index])
			self.files()[file.index].fileSavings(fileSavings)
			self.files()[file.index].status('success')
		}).catch(function(err) {
			self.files()[file.index].status('fail')
			console.log(err)
		})
	}

	iom.prototype.loadFiles = function() {
		if(this.enabledSettingsOverlay()) {
			return
		}
		ipcRenderer.send('load-files')
	}

	iom.prototype._receiveLoadedFiles = function(files) {
		var self = this
		var filesToProcess = []

		files.forEach(function(file) {
			filesToProcess.unshift({
				path: file,
				size: self._getFileSize(file)
			})
		})

		self.addFilesToList(filesToProcess, true)
	}

	iom.prototype.setSettingsOverlay = function() {
		if(this.settingsOverlay.classList.value.indexOf('addOverlay') === -1) {
			this.settingsOverlay.classList.add('addOverlay')
			this.enabledSettingsOverlay(true)
		} else {
			this.settingsOverlay.classList.remove('addOverlay')
			this.enabledSettingsOverlay(false)
		}
	}

	iom.prototype.reprocessFiles = function() {
		var self = this
		if(this.enabledSettingsOverlay()) {
			return
		}

		for(var ii = 0; ii < self.files().length; ii++) {
			try {
				self.files()[ii].status('processing')
				self.files()[ii].initialFileSize(self._getFileSize(self.files()[ii].filePath))
				self.files()[ii].finalFileSize('')
				self.files()[ii].fileSavings('')
				self._compressImageFile(self.files()[ii])
			} catch(err) {
				self.files()[ii].status('fail')
			}
		}
	}

	iom.prototype.clearList = function() {
		if(this.enabledSettingsOverlay()) {
			return
		}
		this.files.removeAll()
	}

	iom.prototype.selectTab = function(tabName) {
		this.imageminSettings.forEach(function(setting) {
			if(setting.fileType === tabName) {
				setting.active(true)
			} else {
				setting.active(false)
			}
		})
	}

	iom.prototype.setSettings = function(fileType, plugin) {
		var index = 0
		switch(fileType) {
			case 'JPG':
				index = 0
				break
			case 'PNG':
				index = 1
				break
			case 'SVG':
				index = 2
				break
			case 'GIF':
				index = 3
				break
		}

		this.imageminSettings[index].activePlugin(plugin)
	}

	iom.prototype._getFileSize = function(filePath) {
		var stats = fs.statSync(filePath)
		var fileSizeInBytes = stats.size
		return fileSizeInBytes
	}

	iom.prototype._getFinalFileSize = function(bytes) {
		var kb, mb

		if(bytes === '' || bytes === undefined) {
			return ''
		}

		if(bytes > 1000) {
			kb = bytes / 1000
		} else {
			return bytes + 'b'
		}

		if(kb > 1000) {
			mb = bytes / 1000000
			return(mb).toFixed(this.mbDecimals) + 'mb'
		} else {
			return Math.round(kb) + 'kb'
		}
	}

	iom.prototype._getFileSavings = function(file) {
		var initialSize = file.initialFileSize()
		var finalSize = file.finalFileSize()
		return(100 - ((finalSize * 100) / initialSize)).toFixed(this.percentageDecimals) + '%'
	}

	iom.prototype._getImageminSettings = function() {
		var userImageminSettings = {
			JPG: {},
			PNG: {},
			SVG: {},
			GIF: {}
		}

		// Iterate through file types
		this.imageminSettings.forEach(function(imageminSetting) {
			// Iterate through plugins
			imageminSetting.plugins.forEach(function(imageminPlugin) {
				if(imageminPlugin.name === imageminSetting.activePlugin()) {
					var options = {}

					imageminPlugin.settings.forEach(function(pluginSetting) {
						if(pluginSetting.checkbox()) {
							switch(pluginSetting.type()) {
								case 'checkbox':
									options[pluginSetting.name] = pluginSetting.checkbox()
									break
								case 'checkbox-text':
									options[pluginSetting.name] = pluginSetting.textValue()
									break
								case 'checkbox-dropdown':
									options[pluginSetting.name] = pluginSetting.dropdownSelection()
									break
								default:
									break
							}
						}
					})

					userImageminSettings[imageminSetting.fileType].plugin = imageminPlugin.plugin
					userImageminSettings[imageminSetting.fileType].options = options
				}
			})
		})

		return userImageminSettings
	}

	iom.prototype._loadPrefFileSettings = function() {
		this.includeSubfolders(JSON.parse(localStorage.includeSubfolders))
		this.saveInSubFolder(JSON.parse(localStorage.saveInSubFolder))
		var prefFileSettings = JSON.parse(fs.readFileSync(this.localStorageSettingsPath(), 'utf8'))
		this._loadImageminPrefs(prefFileSettings)
	}

	iom.prototype._loadPresetsFileSettings = function() {
		var presetsFileSettings = JSON.parse(fs.readFileSync(this.localStoragePresetsPath(), 'utf8'))
		this.presets(presetsFileSettings)
	}

	iom.prototype._loadImageminPrefs = function(prefFileSettings) {
		for(var i = 0; i < this.imageminSettings.length; i++) {
			this.imageminSettings[i].active(prefFileSettings[i].active)
			this.imageminSettings[i].activePlugin(prefFileSettings[i].activePlugin)

			for(var j = 0; j < this.imageminSettings[i].plugins.length; j++) {
				for(var k = 0; k < this.imageminSettings[i].plugins[j].settings.length; k++) {
					this.imageminSettings[i].plugins[j].settings[k].checkbox(prefFileSettings[i].plugins[j].settings[k].checkbox)
					this.imageminSettings[i].plugins[j].settings[k].textValue(prefFileSettings[i].plugins[j].settings[k].textValue)
					this.imageminSettings[i].plugins[j].settings[k].dropdownSelection(prefFileSettings[i].plugins[j].settings[k].dropdownSelection)
				}
			}
		}
	}

	iom.prototype._savePrefToCache = function(args) {
		localStorage.includeSubfolders = this.includeSubfolders()
		localStorage.saveInSubFolder = this.saveInSubFolder()

		try {
			fs.writeFileSync(this.localStorageSettingsPath(), args)
		} catch(err) {}
	}

	iom.prototype._savePresetsToCache = function(args) {
		try {
			fs.writeFileSync(this.localStoragePresetsPath(), args)
		} catch(err) {}
	}

	iom.prototype.openQuickLook = function() {
		if(this.selectedFile()) {
			ipcRenderer.send('open-quick-look', this.selectedFile().filePath)
		}
	}

	iom.prototype.closeQuickLook = function() {
		ipcRenderer.send('close-quick-look')
	}

  iom.prototype.lockToggle = function() {
    this.lockedSettings(!this.lockedSettings())
    this.mainMenu.lockSettingsMenuItem.checked = this.lockedSettings()
  }

  iom.prototype.selectAllToggle = function() {
    var self = this;
    this.imageminSettings.forEach(function(imageminSettings) {
      if(imageminSettings.active()) {
        imageminSettings.plugins.forEach(function(plugin) {
          if(plugin.name === imageminSettings.activePlugin()) {
            plugin.settings.forEach(function(setting) {
              setting.checkbox(self.selectAllButton());
            })
          }
        })
      }
    })
    this.selectAllButton(!this.selectAllButton())
  }

	iom.prototype.addPreset = function() {
		var self = this
		this.presets.push({
			name: self.newPresetName(),
			settings: {
				imagemin: ko.toJSON(self.imageminSettings),
				includeSubfolders: this.includeSubfolders(),
				saveInSubFolder: this.saveInSubFolder()
			}
		})
		this.newPresetName('')
	}

	iom.prototype.loadPreset = function() {
		var selectedPreset = this.selectedPreset()
		this.includeSubfolders(selectedPreset.settings.includeSubfolders)
		this.saveInSubFolder(selectedPreset.settings.saveInSubFolder)
		var prefFileSettings = JSON.parse(selectedPreset.settings.imagemin)
		this._loadImageminPrefs(prefFileSettings)
	}

	iom.prototype.deletePreset = function() {
		var index = this.presets().indexOf(this.selectedPreset())
		if(index > -1) {
			this.presets.splice(index, 1)
		}
	}

	iom.prototype.openLink = function() {
		shell.openExternal('https://www.npmjs.com/browse/keyword/imageminplugin')
	}

	iom.prototype._attachAppListeners = function() {
		var self = this

		// Helpers
		ipcRenderer.on('console-on-renderer', function(event, args) {
			console.log(args)
		})

		ipcRenderer.on('loaded-files', function(event, files) {
			self._receiveLoadedFiles(files)
		})

		ipcRenderer.on('load-file', function(event, path) {
			self._receiveLoadedFiles([path])
		})

		ipcRenderer.on('delete-file', function(event) {
			self.deleteFile()
		})

		ipcRenderer.on('quick-look', function(event, path) {
			if(!self.quickLook()) {
				self.openQuickLook()
				self.quickLook(true)
			} else {
				self.closeQuickLook()
				self.quickLook(false)
			}
		})

		ipcRenderer.on('toggle-checkForUpdatesMenuItem', function(event, state) {
			self.mainMenu.checkForUpdatesMenuItem.enabled = state
		})

		ipcRenderer.on('send-localStoragePath', function(event, localStoragePath) {
			self.localStorageSettingsPath(localStoragePath + '/Local Storage/iomPreferences.json')
			self.localStoragePresetsPath(localStoragePath + '/Local Storage/iomPlugins.json')

			// Read preference file if it exists
			try {
				fs.statSync(self.localStorageSettingsPath()).isFile()
				self._loadPrefFileSettings()
			} catch(err) {}

			// Read presets file if it exists
			try {
				fs.statSync(self.localStoragePresetsPath()).isFile()
				self._loadPresetsFileSettings()
			} catch(err) {}

			// Set preference file computed only after obtaining local storage path
			self.prefFileComputed = ko.computed(function() {
				var plugins = ko.toJSON(this.imageminSettings)
				var includeSubfolders = self.includeSubfolders()
				var saveInSubFolder = self.saveInSubFolder()

				if(self.localStorageSettingsPath() !== '') {
					self._savePrefToCache(plugins)
				}

				return true
			}, self)

			// Set presets file computed only after obtaining local storage path
			self.presetsFileComputed = ko.computed(function() {
				var presets = ko.toJSON(this.presets)

				if(self.localStorageSettingsPath() !== '') {
					self._savePresetsToCache(presets)
				}

				return true
			}, self)
		})
	}

	ko.applyBindings(new iom())
})(window)
