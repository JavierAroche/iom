/*
 *
 *  iom - Image Optimization Manager (Renderer Process)
 *  Author: Javier Aroche
 *
 */

;(function(window) {
	'use strict';

	const fs = require('fs');
	const path = require('path');
	const { ipcRenderer, shell } = require('electron');
	const imagemin = require('imagemin');
	const MainMenu = require('./app/MainMenu');
	const ImageminSettings = require('./app/ImageminSettings');
	window.ko = require('knockout');

	function iom() {
		this.localStorageSettingsPath = ko.observable();
		this.localStoragePresetsPath = ko.observable();
		this.mainMenu = new MainMenu(this);
		this.animOverlay = document.getElementsByClassName('animOverlay')[0];
		this.settingsOverlay = document.getElementsByClassName('settingsOverlay')[0];
		this.lockedSettings = ko.observable(true);
		this.enabledSettingsOverlay = ko.observable(false);
		this.imageminSettings = new ImageminSettings(this).plugins;
		this.selectAllButton = ko.observable(true);
		this.selectAllButtonText = ko.computed(() => {
			return this.selectAllButton() ? 'Select All' : 'Deselect All';
		}, this);
		this.includeSubfolders = ko.observable(false);
		this.saveInSubFolder = ko.observable(true);
		this.quickLook = ko.observable(false);
		this.selectedFile = ko.observable();
		this.mbDecimals = 2;
		this.percentageDecimals = 1;
		this.files = ko.observableArray();
		this.totalPercentageSavings = ko.observable('0.0%');
		this.totalSavings = ko.computed(() => {
			let initialBytes = 0;
			let finalBytes = 0;
			let savedBytes = 0;
			let savedTotal = '0 kb';
			let percentageSaved = '0.0%';
			this.files().forEach(file => {
				if(file.status() === 'success') {
					initialBytes = initialBytes + file.initialFileSize();
					finalBytes = finalBytes + file.finalFileSize();
				}
			});
			savedBytes = initialBytes - finalBytes;

			if(savedBytes > 0) {
				savedTotal = this._getFinalFileSize(savedBytes);
				percentageSaved = (100 - ((finalBytes * 100) / initialBytes)).toFixed(this.percentageDecimals) + '%';
			}

			this.totalPercentageSavings(percentageSaved);
			return savedTotal;
		}, this);
		this.acceptableFileTypes = ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG', 'svg', 'SVG', 'gif', 'GIF'];
		this.newPresetName = ko.observable();
		this.presets = ko.observableArray([{
			name: 'Default...',
			settings: {
				imagemin: ko.toJSON(this.imageminSettings),
				includeSubfolders: this.includeSubfolders(),
				saveInSubFolder: this.saveInSubFolder()
			}
		}], this);
		this.selectedPresetValue = ko.observable('Default...');
		this.selectedPreset = ko.computed(() => {
			let selectedPresetValue = this.selectedPresetValue();
			let selectedPreset = this.presets()[0];
			this.presets().forEach(preset => {
				if(preset.name === selectedPresetValue) {
					selectedPreset = preset;
				}
			});
			return selectedPreset;
		}, this);

		// Settings menu item
		this.mainMenu.settingsMenuItem.checked = this.enabledSettingsOverlay();
		this.mainMenu.lockSettingsMenuItem.checked = this.lockedSettings();
		this._init();
	};

	iom.prototype._init = function() {
		this._setPlaceholderListeners();
		this._attachAppListeners();
		ipcRenderer.send('request-localStoragePath');
	};

	iom.prototype._setPlaceholderListeners = function() {
		let self = this;
		// Drag over event for the drop area
		document.addEventListener('dragover', event => {
			event.preventDefault();
			if(!self.enabledSettingsOverlay()) {
				self.animOverlay.classList.add('dragged-over');
			}
			return false;
		}, false);

		// Drop event for the drop area
		document.addEventListener('drop', event => {
			event.preventDefault();
			if(!self.enabledSettingsOverlay()) {
				let files = event.dataTransfer.files;
				self.addFilesToList(files, true);
				self.animOverlay.classList.remove('dragged-over');
			}
			return false;
		}, false);

		// Drag leave the drop area
		document.addEventListener('dragleave', event => {
			event.preventDefault();
			self.animOverlay.classList.remove('dragged-over');
			return false;
		}, false);
	};

	iom.prototype.addFilesToList = function(files, mainFolder) {
		for(let i = 0; i < files.length; i++) {
			let fileStats = fs.statSync(files[i].path);
			if(fileStats.isDirectory()) {
				let filesInFolder = this._getFolderContents(files[i].path);
				if(this.includeSubfolders() || mainFolder) {
					this.addFilesToList(filesInFolder, false);
				}
			} else {
				this._addFileToList(files[i]);
			}
		}
	};

	iom.prototype._addFileToList = function(file) {
		let pathProperties = path.parse(file.path);
		let name = pathProperties.base;
		let parentFolder = pathProperties.dir;
		let filePath = file.path;
		let fileSize = file.size;
		let fileType = pathProperties.ext.replace('.', '');
		let index = this.files().length;
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
			});
			this._compressImageFile(this.files()[index]);
		}
	};

	iom.prototype._getFolderContents = function(folder) {
		let self = this;
		let filesInFolder = fs.readdirSync(folder);
		let files = [];

		filesInFolder.forEach(file => {
			let filePath = path.resolve(folder, file);
			files.unshift({
				path: filePath,
				size: self._getFileSize(filePath)
			});
		});
		return files;
	};

	iom.prototype.openContainingFolder = function(filePath) {
		shell.showItemInFolder(filePath);
	};

	iom.prototype.selectFile = function(model, data) {
		model.deselectAllFiles();
		data.selected(true);
		model.selectedFile(data);
	};

	iom.prototype.deselectAllFiles = function() {
		this.files().forEach(function(file) {
			file.selected(false);
		});
	};

	iom.prototype.deleteFile = function() {
		this.files.remove(this.selectedFile());
	};

	/*
	 * @private
	 * Handler function to compress an image file with imagemin
	 * @param {Object}
	 */
	iom.prototype._compressImageFile = function(file) {
		let self = this;
		let fileType = file.fileType.toUpperCase();
		let userImageminSettings = this._getImageminSettings();
		let outputFolder;

		if(this.saveInSubFolder()) {
			outputFolder = file.parentFolder + '/_exports';
		} else {
			outputFolder = file.parentFolder;
		}

		imagemin([file.filePath], outputFolder, {
			plugins: [userImageminSettings[fileType].plugin(userImageminSettings[fileType].options)]
		}).then(files => {
			let compressedFile = files[0];
			let finalFileSize = self._getFileSize(compressedFile.path);
			self.files()[file.index].finalFileSize(finalFileSize);
			let fileSavings = self._getFileSavings(self.files()[file.index]);
			self.files()[file.index].fileSavings(fileSavings);
			self.files()[file.index].status('success');
		}).catch(err => {
			self.files()[file.index].status('fail');
			console.log(err);
		});
	};

	iom.prototype.loadFiles = function() {
		if(this.enabledSettingsOverlay()) {
			return;
		}
		ipcRenderer.send('load-files');
	};

	iom.prototype._receiveLoadedFiles = function(files) {
		let self = this;
		let filesToProcess = [];

		files.forEach(file => {
			filesToProcess.unshift({
				path: file,
				size: self._getFileSize(file)
			});
		});

		self.addFilesToList(filesToProcess, true);
	};

	iom.prototype.setSettingsOverlay = function() {
		if(this.settingsOverlay.classList.value.indexOf('addOverlay') === -1) {
			this.settingsOverlay.classList.add('addOverlay');
			this.enabledSettingsOverlay(true);
		} else {
			this.settingsOverlay.classList.remove('addOverlay');
			this.enabledSettingsOverlay(false);
		}
	};

	iom.prototype.reprocessFiles = function() {
		let self = this;
		if(this.enabledSettingsOverlay()) {
			return;
		}

		for(let ii = 0; ii < self.files().length; ii++) {
			try {
				self.files()[ii].status('processing');
				self.files()[ii].initialFileSize(self._getFileSize(self.files()[ii].filePath));
				self.files()[ii].finalFileSize('');
				self.files()[ii].fileSavings('');
				self._compressImageFile(self.files()[ii]);
			} catch(err) {
				self.files()[ii].status('fail');
			}
		}
	};

	iom.prototype.clearList = function() {
		if(this.enabledSettingsOverlay()) {
			return;
		}
		this.files.removeAll();
	};

	iom.prototype.selectTab = function(tabName) {
		this.imageminSettings.forEach(setting => {
			if(setting.fileType === tabName) {
				setting.active(true);
			} else {
				setting.active(false);
			}
		});
	};

	iom.prototype.setSettings = function(fileType, plugin) {
		let index = 0;
		switch(fileType) {
			case 'JPG':
				index = 0;
				break;
			case 'PNG':
				index = 1;
				break;
			case 'SVG':
				index = 2;
				break;
			case 'GIF':
				index = 3;
				break;
		}
		this.imageminSettings[index].activePlugin(plugin);
	};

	iom.prototype._getFileSize = function(filePath) {
		let stats = fs.statSync(filePath);
		let fileSizeInBytes = stats.size;
		return fileSizeInBytes;
	};

	iom.prototype._getFinalFileSize = function(bytes) {
		let kb, mb;

		if(bytes === '' || bytes === undefined) {
			return '';
		}

		if(bytes > 1000) {
			kb = bytes / 1000;
		} else {
			return bytes + 'b';
		}

		if(kb > 1000) {
			mb = bytes / 1000000;
			return(mb).toFixed(this.mbDecimals) + 'mb';
		} else {
			return Math.round(kb) + 'kb';
		}
	};

	iom.prototype._getFileSavings = function(file) {
		let initialSize = file.initialFileSize();
		let finalSize = file.finalFileSize();
		return(100 - ((finalSize * 100) / initialSize)).toFixed(this.percentageDecimals) + '%';
	};

	iom.prototype._getImageminSettings = function() {
		let userImageminSettings = {
			JPG: {},
			PNG: {},
			SVG: {},
			GIF: {}
		};

		// Iterate through file types
		this.imageminSettings.forEach(imageminSetting => {
			// Iterate through plugins
			imageminSetting.plugins.forEach(imageminPlugin => {
				if(imageminPlugin.name === imageminSetting.activePlugin()) {
					let options = {};

					imageminPlugin.settings.forEach(pluginSetting => {
						if(pluginSetting.checkbox()) {
							switch(pluginSetting.type()) {
								case 'checkbox':
									options[pluginSetting.name] = pluginSetting.checkbox();
									break;
								case 'checkbox-text':
									options[pluginSetting.name] = pluginSetting.textValue();
									break;
								case 'checkbox-dropdown':
									options[pluginSetting.name] = pluginSetting.dropdownSelection();
									break;
								default:
									break;
							}
						}
					});
					userImageminSettings[imageminSetting.fileType].plugin = imageminPlugin.plugin;
					userImageminSettings[imageminSetting.fileType].options = options;
				}
			});
		});

		return userImageminSettings;
	};

	iom.prototype._loadPrefFileSettings = function() {
		this.includeSubfolders(JSON.parse(localStorage.includeSubfolders));
		this.saveInSubFolder(JSON.parse(localStorage.saveInSubFolder));
		let prefFileSettings = JSON.parse(fs.readFileSync(this.localStorageSettingsPath(), 'utf8'));
		this._loadImageminPrefs(prefFileSettings);
	};

	iom.prototype._loadPresetsFileSettings = function() {
		let presetsFileSettings = JSON.parse(fs.readFileSync(this.localStoragePresetsPath(), 'utf8'));
		this.presets(presetsFileSettings);
	};

	iom.prototype._loadImageminPrefs = function(prefFileSettings) {
		for(let i = 0; i < this.imageminSettings.length; i++) {
			this.imageminSettings[i].active(prefFileSettings[i].active);
			this.imageminSettings[i].activePlugin(prefFileSettings[i].activePlugin);

			for(let j = 0; j < this.imageminSettings[i].plugins.length; j++) {
				for(let k = 0; k < this.imageminSettings[i].plugins[j].settings.length; k++) {
					this.imageminSettings[i].plugins[j].settings[k].checkbox(prefFileSettings[i].plugins[j].settings[k].checkbox);
					this.imageminSettings[i].plugins[j].settings[k].textValue(prefFileSettings[i].plugins[j].settings[k].textValue);
					this.imageminSettings[i].plugins[j].settings[k].dropdownSelection(prefFileSettings[i].plugins[j].settings[k].dropdownSelection);
				}
			}
		}
	};

	iom.prototype._savePrefToCache = function(args) {
		localStorage.includeSubfolders = this.includeSubfolders();
		localStorage.saveInSubFolder = this.saveInSubFolder();

		try {
			fs.writeFileSync(this.localStorageSettingsPath(), args);
		} catch(err) {
			console.log(err);
		}
	};

	iom.prototype._savePresetsToCache = function(args) {
		try {
			fs.writeFileSync(this.localStoragePresetsPath(), args);
		} catch(err) {
			console.log(err);
		}
	};

	iom.prototype.openQuickLook = function() {
		if(this.selectedFile()) {
			ipcRenderer.send('open-quick-look', this.selectedFile().filePath);
		}
	};

	iom.prototype.closeQuickLook = function() {
		ipcRenderer.send('close-quick-look');
	};

	iom.prototype.lockToggle = function() {
		this.lockedSettings(!this.lockedSettings());
		this.mainMenu.lockSettingsMenuItem.checked = this.lockedSettings();
	};

	iom.prototype.selectAllToggle = function() {
		let self = this;
		this.imageminSettings.forEach((imageminSettings) => {
			if(imageminSettings.active()) {
				imageminSettings.plugins.forEach((plugin) => {
					if(plugin.name === imageminSettings.activePlugin()) {
						plugin.settings.forEach((setting) => {
							setting.checkbox(self.selectAllButton());
						});
					}
				});
			}
		});
		this.selectAllButton(!this.selectAllButton());
	};

	iom.prototype.addPreset = function() {
		let self = this;
		this.presets.push({
			name: self.newPresetName(),
			settings: {
				imagemin: ko.toJSON(self.imageminSettings),
				includeSubfolders: this.includeSubfolders(),
				saveInSubFolder: this.saveInSubFolder()
			}
		});
		this.newPresetName('');
	};

	iom.prototype.loadPreset = function() {
		let selectedPreset = this.selectedPreset();
		this.includeSubfolders(selectedPreset.settings.includeSubfolders);
		this.saveInSubFolder(selectedPreset.settings.saveInSubFolder);
		let prefFileSettings = JSON.parse(selectedPreset.settings.imagemin);
		this._loadImageminPrefs(prefFileSettings);
	};

	iom.prototype.deletePreset = function() {
		let index = this.presets().indexOf(this.selectedPreset());
		if(index > -1) {
			this.presets.splice(index, 1);
		}
	};

	iom.prototype.openLink = function() {
		shell.openExternal('https://www.npmjs.com/browse/keyword/imageminplugin');
	};

	iom.prototype._attachAppListeners = function() {
		let self = this;

		// Helpers
		ipcRenderer.on('console-on-renderer', (event, args) => {
			console.log(args);
		});

		ipcRenderer.on('loaded-files', (event, files) => {
			self._receiveLoadedFiles(files);
		});

		ipcRenderer.on('load-file', (event, path) => {
			self._receiveLoadedFiles([path]);
		});

		ipcRenderer.on('delete-file', (event) => {
			self.deleteFile();
		});

		ipcRenderer.on('quick-look', (event, path) => {
			if(!self.quickLook()) {
				self.openQuickLook();
				self.quickLook(true);
			} else {
				self.closeQuickLook();
				self.quickLook(false);
			}
		});

		ipcRenderer.on('toggle-checkForUpdatesMenuItem', (event, state) => {
			self.mainMenu.checkForUpdatesMenuItem.enabled = state;
		});

		ipcRenderer.on('send-localStoragePath', (event, localStoragePath) => {
			self.localStorageSettingsPath(localStoragePath + '/Local Storage/iomPreferences.json');
			self.localStoragePresetsPath(localStoragePath + '/Local Storage/iomPlugins.json');

			// Read preference file if it exists
			try {
				fs.statSync(self.localStorageSettingsPath()).isFile();
				self._loadPrefFileSettings();
			} catch(err) {
				console.log(err);
			};

			// Read presets file if it exists
			try {
				fs.statSync(self.localStoragePresetsPath()).isFile();
				self._loadPresetsFileSettings();
			} catch(err) {
				console.log(err);
			}

			// Set preference file computed only after obtaining local storage path
			self.prefFileComputed = ko.computed(() => {
				let plugins = ko.toJSON(this.imageminSettings);
				let includeSubfolders = self.includeSubfolders();
				let saveInSubFolder = self.saveInSubFolder();
				if(self.localStorageSettingsPath() !== '') {
					self._savePrefToCache(plugins);
				}
				return true;
			}, self);

			// Set presets file computed only after obtaining local storage path
			self.presetsFileComputed = ko.computed(() => {
				let presets = ko.toJSON(this.presets);
				if(self.localStorageSettingsPath() !== '') {
					self._savePresetsToCache(presets);
				}
				return true;
			}, self);
		});
	};

	ko.applyBindings(new iom());
})(window);
