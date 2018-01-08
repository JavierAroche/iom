<img src="/icon/iom.png" width="150" height="150">

[![npm-image](https://img.shields.io/badge/iom-v0.0.4-09bc00.svg)](https://github.com/JavierAroche/iom)

## Description
Image optimization manager to minify images using [imagemin](https://github.com/imagemin/imagemin).

## Latest Release
* [MacOS](https://raw.githubusercontent.com/JavierAroche/iom/master/releases/darwin/v0.0.4/iom_v0.0.4.zip)
* [Windows](https://raw.githubusercontent.com/JavierAroche/iom/master/releases/win32/v0.0.4/iom_v0.0.4.zip)
* [Linux](https://raw.githubusercontent.com/JavierAroche/iom/master/releases/linux/v0.0.4/iom_v0.0.4.zip)

## Usage
Drag and drop images to the iom app. Click on the settings icon to change imagemin's plugin settings.

NOTE: Images will not be overwritten by default. Change this behavior in the settings.

## External Usage
CLI
```
Usage: iom file [option ...] ...

Options
-s <setting [option]> Use setting with options
-sub <folder name>    Save exports in subfolder (keep original)
-i                    Include subfolders when loading a folder
-h, --help            Show iom options
```

Protocol
```
iom:///file
```

## License
MIT © Javier Aroche
