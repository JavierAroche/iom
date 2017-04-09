/*
 *
 *  iom - Image Optimization Manager (Renderer Process)
 *  Author: Javier Aroche
 *
 */

;(function(window) {
	
    'use strict';

    const fs   = require('fs');
    const path = require('path');
    const exec = require('child_process').exec;
    const { dialog } = require('electron').remote;
    const { ipcRenderer, shell } = require('electron');
	
	const imagemin = require('imagemin');
	const MainMenu = require('./app/MainMenu');
	const ImageminSettings = require('./app/ImageminSettings');
	
    window.ko = require('knockout');
	
    function iom() {
		this.localStoragePath = ko.observable('');
		this.mainMenu = new MainMenu(this);
        this.animOverlay = document.getElementsByClassName('animOverlay')[0];
        this.settingsOverlay = document.getElementsByClassName('settingsOverlay')[0];
		this.enabledSettingsOverlay = ko.observable(false);
		this.imageminSettings = new ImageminSettings(this).plugins;
		this.includeSubfolders = ko.observable(false);
		this.mbDecimals = 2;
		this.percentageDecimals = 1;
		this.files = ko.observableArray();
		this.totalPercentageSavings = ko.observable('0.0%');
		this.totalSavings = ko.computed(function() {
			var initialBytes = 0,
				finalBytes = 0,
				savedBytes = 0,
				savedTotal = '0 kb',
				percentageSaved = '0.0%';
			
			this.files().forEach(function(file) {
				if(file.status() == 'success') {
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
		
		// Settings menu item
        this.mainMenu.settingsMenuItem.checked = false;
		
        this._init();
    };
    
    iom.prototype._init = function() {
        this._setPlaceholderListeners();
		this._attachAppListeners();
        ipcRenderer.send('request-localStoragePath');
    };

    iom.prototype._setPlaceholderListeners = function() {
        var self = this;
        
		// Drag over event for the drop area
        document.addEventListener('dragover', function(event) {
            event.preventDefault();
            
            if(!self.enabledSettingsOverlay()) {
	            self.animOverlay.classList.add('dragged-over');
	        }
            
            return false;
        }, false);

        // Drop event for the drop area
        document.addEventListener('drop', function(event) {
            event.preventDefault();
            
	        if(!self.enabledSettingsOverlay()) {
	            var files = event.dataTransfer.files;
				self.addFilesToList(files, true);
	            self.animOverlay.classList.remove('dragged-over');
	        }
            
            return false;
        }, false);

        // Drag leave the drop area
        document.addEventListener('dragleave',function(event) {
            event.preventDefault();
            
	        self.animOverlay.classList.remove('dragged-over');

            return false;
        }, false);
    };
	
	iom.prototype.addFilesToList = function(files, mainFolder) {
		for(var i = 0; i < files.length; i++) {
			var fileStats = fs.statSync(files[i].path);
			if(fileStats.isDirectory()) {
				var filesInFolder = this._getFolderContents(files[i].path);
				if(this.includeSubfolders() || mainFolder) {
					this.addFilesToList(filesInFolder, false);
				}
			} else {
				this._addFileToList(files[i]);
			}
		}
	};
	
	iom.prototype._addFileToList = function(file) {		
		var pathProperties = path.parse(file.path),
			name = pathProperties.base,
			parentFolder = pathProperties.dir,
			filePath = file.path,
			fileSize = file.size,
			fileType = pathProperties.ext.replace('.', ''),
			index = this.files().length;

		if(this.acceptableFileTypes.indexOf(fileType) !== -1) {
			this.files.push({
				name : ko.observable(name),
				initialFileSize : ko.observable(fileSize),
				finalFileSize : ko.observable(),
				fileSavings : ko.observable(),
				status : ko.observable('processing'),
				parentFolder : parentFolder,
				filePath : filePath,
				fileType : fileType,
				index : index
			});
			
			this._compressImageFile(this.files()[index]);
		}
	};
	
	iom.prototype._getFolderContents = function(folder) {
		var self = this;
		
		var filesInFolder = fs.readdirSync(folder),
			files = [];
		
		filesInFolder.forEach(function(file) {
			var filePath = path.resolve(folder, file);
			
			files.unshift({
				path : filePath,
				size : self._getFileSize(filePath)
			});
		});
		
		return files;
	};

	iom.prototype.openContainingFolder = function(filePath) {
		shell.showItemInFolder(filePath);
	};
	
   /*
    * @private
    * Handler function to compress an image file with imagemin
	* @param {Object} 
    */
    iom.prototype._compressImageFile = function(file) {
		var self = this;
		var fileType = file.fileType.toUpperCase();
		var userImageminSettings = this._getImageminSettings();
		
		imagemin([file.filePath], file.parentFolder, {
			plugins: [ userImageminSettings[fileType].plugin(userImageminSettings[fileType].options) ]
		}).then(files => {
			var compressedFile = files[0];
			var finalFileSize = self._getFileSize(compressedFile.path);
			self.files()[file.index].finalFileSize(finalFileSize);			
			var fileSavings = self._getFileSavings(self.files()[file.index]);
			self.files()[file.index].fileSavings(fileSavings);
			
			self.files()[file.index].status('success');
		}).catch(function(err){
			self.files()[file.index].status('fail');
			console.log(err)
		});
    };
	
	iom.prototype.loadFiles = function() {
		var self = this;
		if(this.enabledSettingsOverlay()) { return; }

        ipcRenderer.send('load-files');
        ipcRenderer.once('loaded-files', function(event, files) {
        	var filesToProcess = [];
        	
        	files.forEach(function(file) {
        		filesToProcess.unshift({
	        		path : file,
					size : self._getFileSize(file)
				});
        	});

        	self.addFilesToList(filesToProcess, true);
        });
	};

	iom.prototype.setSettingsOverlay = function() {
		if(this.settingsOverlay.classList.value.indexOf('addOverlay') == -1) {
			this.settingsOverlay.classList.add('addOverlay');
			this.enabledSettingsOverlay(true);
			this.mainMenu.settingsMenuItem.checked = true;
		} else {
			this.settingsOverlay.classList.remove('addOverlay');
			this.enabledSettingsOverlay(false);
			this.mainMenu.settingsMenuItem.checked = false;
		}	
	};
	
	iom.prototype.reprocessFiles = function() {
		var self = this;
		if(this.enabledSettingsOverlay()) { return; }
		
		for(var ii = 0; ii < self.files().length; ii++) {
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
		if(this.enabledSettingsOverlay()) { return; }
		this.files.removeAll();
	};
	
	iom.prototype.selectTab = function(tabName) {
		this.imageminSettings.forEach(function(setting) {
			if(setting.fileType == tabName) {
				setting.active(true);
			} else {
				setting.active(false);
			}
		});
	};

	iom.prototype.setSettings = function(fileType, plugin) {
		var self = this;
		var index = 0;
		
		switch(fileType) {
			case 'JPG': index = 0; break;
			case 'PNG': index = 1; break;
			case 'SVG': index = 2; break;
			case 'GIF': index = 3; break;
		}
		
		this.imageminSettings[index].activePlugin(plugin);
	};
	
	iom.prototype._getFileSize = function(filePath) {
		var stats = fs.statSync(filePath);
		var fileSizeInBytes = stats.size;
		return fileSizeInBytes;
	};
	
	iom.prototype._getFinalFileSize = function(bytes) {
		var kb, mb;
			
		if(bytes == '' || bytes == undefined) { 
			return '';
		}

		if(bytes > 1000) {
			kb = bytes / 1000;
		} else {
			return bytes + 'b';
		}
		
		if(kb > 1000) {
			mb = bytes / 1000000;
			return (mb).toFixed(this.mbDecimals) + 'mb';
		} else {
			return Math.round(kb) + 'kb';
		}
	};
	
	iom.prototype._getFileSavings = function(file) {
		var initialSize = file.initialFileSize();
		var finalSize = file.finalFileSize();
		return (100 - ((finalSize * 100) / initialSize)).toFixed(this.percentageDecimals) + '%';
	};
	
	iom.prototype._getImageminSettings = function() {
		var self = this;
		var userImageminSettings = {
			JPG : {},
			PNG : {},
			SVG : {},
			GIF : {},
		};
		
		// Iterate through file types
		this.imageminSettings.forEach(function(imageminSetting) {
			// Iterate through plugins
			imageminSetting.plugins.forEach(function(imageminPlugin) {				
				if(imageminPlugin.name == imageminSetting.activePlugin()) {
					var options = {};
					
					imageminPlugin.settings.forEach(function(pluginSetting) {
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
			})
		});
		
		return userImageminSettings;
	};
	
	iom.prototype._loadPrefFileSettings = function() {
		var self = this;
		this.includeSubfolders(JSON.parse(localStorage.subFolderPref));
		var prefFileSettings = JSON.parse(fs.readFileSync(this.localStoragePath(), 'utf8'));
		
		for(var i = 0; i < this.imageminSettings.length; i++) {
			this.imageminSettings[i].active(prefFileSettings[i].active);
			this.imageminSettings[i].activePlugin(prefFileSettings[i].activePlugin);
			
			for(var j = 0; j < this.imageminSettings[i].plugins.length; j++) {
				for(var k = 0; k < this.imageminSettings[i].plugins[j].settings.length; k ++) {
					this.imageminSettings[i].plugins[j].settings[k].checkbox(prefFileSettings[i].plugins[j].settings[k].checkbox);
					this.imageminSettings[i].plugins[j].settings[k].textValue(prefFileSettings[i].plugins[j].settings[k].textValue);
					this.imageminSettings[i].plugins[j].settings[k].dropdownSelection(prefFileSettings[i].plugins[j].settings[k].dropdownSelection);
				}
			}
		}
	};
	
	iom.prototype._savePrefToCache = function(args) {
		localStorage.subFolderPref = this.includeSubfolders();
		
		try { 
			fs.writeFileSync(this.localStoragePath(), args); 
		} catch(err) {}
	};
	
	iom.prototype.openLink = function() {
		shell.openExternal('https://www.npmjs.com/browse/keyword/imageminplugin');
	};
	
    iom.prototype._attachAppListeners = function() {
		var self = this;
		
        // Helpers
        ipcRenderer.once('console-on-renderer', function(event, args) {
            console.log(args);
        });

        ipcRenderer.once('toggle-checkForUpdatesMenuItem', function(event, state) {
            self.mainMenu.checkForUpdatesMenuItem.enabled = state;
        });

        ipcRenderer.once('send-localStoragePath', function(event, localStoragePath) {
            self.localStoragePath(localStoragePath + '/Local Storage/iomPreferences.json');
			
			// Read preference file if it exists
			try {
				fs.statSync(self.localStoragePath()).isFile();
				self._loadPrefFileSettings();
			} catch(err) {}
			
			// Set preference file computed only after obtaining local storage path
			self.prefFileComputed = ko.computed(function() {
				var plugins = ko.toJSON(this.imageminSettings);
				var subFolderPref = self.includeSubfolders();

				if(self.localStoragePath() == '') { 
					return true; 
				} else {
					self._savePrefToCache(plugins);
					return true;
				}
			}, self);
		});
    };
    
    ko.applyBindings(new iom);

})(window);