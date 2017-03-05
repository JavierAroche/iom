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
    const { app, ipcRenderer, shell } = require('electron');
	
	const imagemin = require('imagemin');
	const imageminAdvpng = require('imagemin-advpng');
	const imageminGiflossy = require('imagemin-giflossy');
	const imageminGifsicle = require('imagemin-gifsicle');
	const imageminGuetzli = require('imagemin-guetzli');
	const imageminJpegRecompress = require('imagemin-jpeg-recompress');
	const imageminJpegoptim = require('imagemin-jpegoptim');
	const imageminJpegtran = require('imagemin-jpegtran');
	const imageminMozjpeg = require('imagemin-mozjpeg');
	const imageminOptipng = require('imagemin-optipng');
	const imageminPngcrush = require('imagemin-pngcrush');
	const imageminPngout = require('imagemin-pngout');
	const imageminPngquant = require('imagemin-pngquant');
	const imageminSvgo = require('imagemin-svgo');
	const imageminZopfli = require('imagemin-zopfli');

	const MainMenu = require('./app/MainMenu');
	const ImageminSettings = require('./app/ImageminSettings');
	
    window.ko = require('knockout');
	
    function iom() {
		this.mainMenu = new MainMenu(this);
        this.animOverlay = document.getElementsByClassName('animOverlay')[0];
        this.settingsOverlay = document.getElementsByClassName('settingsOverlay')[0];
		this.imageminSettings = new ImageminSettings(this).plugins;
		this.enabledSettingsOverlay = ko.observable(false);
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
        this._init();
    };
    
    iom.prototype._init = function() {
        this._setPlaceholderListeners();
    };

    iom.prototype._setPlaceholderListeners = function() {
        var self = this;
        
		// Drag over event for the drop area
        document.addEventListener('dragover', function(event) {
            event.preventDefault();
            
            if(!self.enabledSettingsOverlay()) {
	            self.animOverlay.classList.add('draged-over');
	        }
            
            return false;
        }, false);

        // Drop event for the drop area
        document.addEventListener('drop', function(event) {
            event.preventDefault();
            
	        if(!self.enabledSettingsOverlay()) {
	            var files = event.dataTransfer.files;
				self.addFilesToList(files);
	            self.animOverlay.classList.remove('draged-over');
	        }
            
            return false;
        }, false);

        // Drag leave the drop area
        document.addEventListener('dragleave',function(event) {
            event.preventDefault();
            
	        self.animOverlay.classList.remove('draged-over');

            return false;
        }, false);
    };
	
	iom.prototype.addFilesToList = function(files) {
		for(var i = 0; i < files.length; i++) {
			var fileStats = fs.statSync(files[i].path);
			if(fileStats.isDirectory()) {
				var filesInFolder = this._getFolderContents(files[i].path);
				// TODO
				// Include subdirectories?
				this.addFilesToList(filesInFolder);
			} else {
				this._addfileToList(files[i]);
			}
		}
	};
	
	iom.prototype._addfileToList = function(file) {
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
				initialFileSizeObservable : ko.observable(this._getFinalFileSize(fileSize)),
				finalFileSize : ko.observable(),
				finalFileSizeObservable : ko.observable(),
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
		
		imagemin([file.filePath], file.parentFolder, {
			plugins: [
				imageminJpegtran({ progressive: true }),
				imageminOptipng({ optimizationLevel: 3 }),
				imageminSvgo({
					plugins: [{ cleanupIDs: false }]
				}),
				imageminGifsicle({ optimizationLevel: 3, colors: 128 })
			]
		}).then(files => {
			var compressedFile = files[0];
			var finalFileSize = self._getFileSize(compressedFile.path);
			self.files()[file.index].finalFileSize(finalFileSize);
			self.files()[file.index].finalFileSizeObservable(self._getFinalFileSize(finalFileSize));
			
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

        	self.addFilesToList(filesToProcess);
        });
	};

	iom.prototype.setSettingsOverlay = function() {
		if(this.settingsOverlay.classList.value.indexOf('addOverlay') == -1) {
			this.settingsOverlay.classList.add('addOverlay');
			this.enabledSettingsOverlay(true);
		} else {
			this.settingsOverlay.classList.remove('addOverlay');
			this.enabledSettingsOverlay(false);
		}
	};
	
	iom.prototype.reprocessFiles = function() {
		var self = this;
		if(this.enabledSettingsOverlay()) { return; }
		
		for(var ii = 0; ii < self.files().length; ii++) {
			self.files()[ii].status('processing');
			self.files()[ii].initialFileSize(self._getFileSize(self.files()[ii].filePath));
			self.files()[ii].finalFileSize('');
			self.files()[ii].fileSavings('');
			self._compressImageFile(self.files()[ii]);
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
			
		if(bytes == '') { 
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
    
    ko.applyBindings(new iom);

})(window);