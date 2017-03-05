/*
 *
 *  iom - Imagemin Settings
 *  Author: Javier Aroche
 *
 */

;(function() {
    
    'use strict';
	
	/*
    * Imagemin Settings constructor.
    * @constructor
    * @param {Context<Object>} The context where the Menu is attached to.
    *                          In this case to the KO ViewModel.
    */
	function ImageminSettings(context) {
		var self = context;
		
		this.plugins = [
			{
				"fileType" : "JPG",
				"active" : ko.observable(true),
				"activePlugin" : ko.observable('jpegtran'),
				"plugins" : [
					{
						"pluginName" : "jpegtran",
						"settings" : [
							{
								"setting" : "progressive",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Lossless conversion to progressive"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "arithmetic",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Use arithmetic coding"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							}
						]
					},
					{
						"pluginName" : "jpegoptim",
						"settings" : [
							{
								"setting" : "progressive",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Lossless conversion to progressive"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "max",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Set maximum image quality factor. (0-100)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(100),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "size",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Target size is specified either in kilo bytes (1-) or as percentage (1%-99%)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable("50%"),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							}
						],
					},
					{
						"pluginName" : "mozjpeg",
						"settings" : [
							{
								"setting" : "progressive",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("False creates baseline JPEG file"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "quality",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Compression quality. Min and max are numbers in range 0 (worst) to 100 (perfect)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(100),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "fastcrush",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Disable progressive scan optimization"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "dcScanOpt",
								"type" : ko.observable("checkbox-dropdown"),
								"title" : ko.observable("Set DC scan optimization mode. \n 0 One scan for all components \n 1 One scan per component \n 2 Optimize between one scan for all components and one scan for 1st component plus one scan for remaining components"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray([0,1,2]),
								"dropdownSelection" : ko.observable(1)
							},
							{
								"setting" : "notrellis",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Disable trellis optimization."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "notrellisDC",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Disable trellis optimization of DC coefficients."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "tune",
								"type" : ko.observable("checkbox-dropdown"),
								"title" : ko.observable("Set trellis optimization method. Available methods: psnr, hvs-psnr, ssim and ms-ssim"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(["psnr", "hvs-psnr", "ssim", "ms-ssimh"]),
								"dropdownSelection" : ko.observable("hvs-psnr")
							},
							{
								"setting" : "noovershoot",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Disable black-on-white deringing via overshoot."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "arithmetic",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Use arithmetic coding."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "quantTable",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Use predefined quantization table. \n 0 JPEG Annex K \n 1 Flat \n 2 Custom, tuned for MS-SSIM \n 3 ImageMagick table by N. Robidoux \n 4 Custom, tuned for PSNR-HVS \n 5 Table from paper by Klein, Silverstein and Carney"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(0),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "smooth",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Set the strength of smooth dithered input. (1...100)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(100),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "maxmemory",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Set the maximum memory to use in kbytes."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(100),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							}
						],
					},
					{
						"pluginName" : "jpgRecompress",
						"settings" : [
							{
								"setting" : "progressive",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Enable progressive encoding."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "accurate",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Favor accuracy over speed."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "quality",
								"type" : ko.observable("checkbox-dropdown"),
								"title" : ko.observable("Set a quality preset. Available presets: low, medium, high and veryhigh."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(["low", "medium", "high", "very high"]),
								"dropdownSelection" : ko.observable("medium")
							},
							{
								"setting" : "method",
								"type" : ko.observable("checkbox-dropdown"),
								"title" : ko.observable("Set comparison method. Available methods: mpe, ssim, ms-ssim and smallfry."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(["mpe", "ssim", "ms-ssim", "smallfry"]),
								"dropdownSelection" : ko.observable("ssim")
							},
							{
								"setting" : "target",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Set target quality."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(0.9999),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "min",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Minimum JPEG quality."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(40),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "max",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Maximum JPEG quality."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(95),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "loops",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Set the number of attempts."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(6),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "defish",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Set defish strength."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(0),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "subsample",
								"type" : ko.observable("checkbox-dropdown"),
								"title" : ko.observable("Set subsampling method. Available values: default, disable."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(["defaut", "disable"]),
								"dropdownSelection" : ko.observable("default")
							},
							{
								"setting" : "strip",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Strips metadata, such as EXIF data."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							}
						],
					},
					{
						"pluginName" : "guetzli",
						"settings" : [
							{
								"setting" : "quality",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Set quality in units equivalent to libjpeg quality. As per guetzli function and purpose, it is not recommended to go below 84. \n\nPlease note that JPEG images do not support alpha channel (transparency). If the input is a PNG with an alpha channel, it will be overlaid on black background before encoding."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(95),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							}
						]
					}
				]
			},
			{
				"fileType" : "PNG",
				"active" : ko.observable(false),
				"activePlugin" : ko.observable("pngquant"),
				"plugins" : [
					{
						"pluginName" : "pngquant",
						"settings" : [
							{
								"setting" : "floyd",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Controls level of dithering (0 = none, 1 = full)."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(0.5),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "nofs",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Disable Floyd-Steinberg dithering."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "posterize",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Reduce precision of the palette by number of bits. Use when the image will be displayed on low-depth screens (e.g. 16-bit displays or compressed textures)."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(4),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "quality",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Instructs pngquant to use the least amount of colors required to meet or exceed the max quality. If conversion results in quality below the min quality the image won't be saved. \nMin and max are numbers in range 0 (worst) to 100 (perfect), similar to JPEG."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(100),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "speed",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Speed/quality trade-off from 1 (brute-force) to 10 (fastest). Speed 10 has 5% lower quality, but is 8 times faster than the default."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(3),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "verbose",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Print verbose status messages."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							}
						]
					},
					{
						"pluginName" : "optipng",
						"settings" : [
							{
								"setting" : "optimizationLevel",
								"type" : ko.observable("checkbox-dropdown"),
								"title" : ko.observable("Select an optimization level between 0 and 7.  \n\nThe optimization level 0 enables a set of optimization operations that require minimal effort. There will be no changes to image attributes like bit depth or color type, and no recompression of existing IDAT datastreams. The optimization level 1 enables a single IDAT compression trial. The trial chosen is what. OptiPNG thinks it’s probably the most effective. The optimization levels 2 and higher enable multiple IDAT compression trials; the higher the level, the more trials.  \n\nLevel and trials: \n 1. 1 trial\n 2. 8 trials\n 3. 16 trials\n 4. 24 trials\n 5. 48 trials\n 6. 120 trials\n 7. 240 trials"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray([1, 2, 3, 4, 5, 6, 7]),
								"dropdownSelection" : ko.observable(3)
							},
							{
								"setting" : "bitDepthReduction",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Apply bit depth reduction."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "colorTypeReduction",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Apply color type reduction."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "paletteReduction",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Apply palette reduction."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							}
						]
					},
					{
						"pluginName" : "pngcrush",
						"settings" : [
							{
								"setting" : "reduce",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Enable lossless color-type or bit-depth reduction."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							}
						]
					},
					{
						"pluginName" : "zopfli",
						"settings" : [
							{
								"setting" : "8bit",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Convert 16-bit per channel image to 8-bit per channel."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "transparent",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Allow altering hidden colors of fully transparent pixels."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "iterations",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Number of iterations for images smaller than 200 KiB."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(15),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "iterationsLarge",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Number of iterations for images larger than 200 KiB."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(5),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "more",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Compress more using more iterations (depending on file size)."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							}
						]
					},
					{
						"pluginName" : "pngout",
						"settings" : [
							{
								"setting" : "strategy",
								"type" : ko.observable("checkbox-dropdown"),
								"title" : ko.observable("Select a strategy level between 0 and 4: \n 0. Extreme \n 1. Intense \n 2. Longest match \n 3. Huffman only \n 4. Uncompressed"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray([0, 1, 2, 3, 4]),
								"dropdownSelection" : ko.observable(0)
							}
						]
					},
					{
						"pluginName" : "advpng",
						"settings" : [
							{
								"setting" : "optimizationLevel",
								"type" : ko.observable("checkbox-dropdown"),
								"title" : ko.observable("Select an optimization level between 0 and 4. \n\n Levels: \n 0 Don't compress \n 1 Compress fast (zlib) \n 2 Compress normal (7z) \n 3 Compress extra (7z) \n 4 Compress extreme (zopfli)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray([0, 1, 2, 3, 4]),
								"dropdownSelection" : ko.observable(3)
							}
						]
					},
					{
						"pluginName" : "guetzli",
						"settings" : [
							{
								"setting" : "quality",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Set quality in units equivalent to libjpeg quality. As per guetzli function and purpose, it is not recommended to go below 84. \n\nPlease note that JPEG images do not support alpha channel (transparency). If the input is a PNG with an alpha channel, it will be overlaid on black background before encoding."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(95),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							}
						]
					}
				]
			},
			{
				"fileType" : "SVG",
				"active" : ko.observable(false),
				"activePlugin" : ko.observable("svgo"),
				"plugins" : [
					{
						"pluginName" : "svgo",
						"settings" : [
							{
								"setting" : "cleanupAttrs",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("cleanup attributes from newlines, trailing, and repeating spaces"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeDoctype",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove doctype declaration"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeXMLProcInst",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove XML processing instructions"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeComments",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove comments"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeMetadata",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove <metadata>"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeTitle",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove <title> (disabled by default)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeDesc",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove <desc> (only non-meaningful by default)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeUselessDefs",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove elements of <defs> without id"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeXMLNS",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("removes xmlns attribute (for inline svg, disabled by default)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeEditorsNSData",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove editors namespaces, elements, and attributes"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeEmptyAttrs",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove empty attributes"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeHiddenElems",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove hidden elements"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeEmptyText",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove empty Text elements"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeEmptyContainers",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove empty Container elements"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeViewBox",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove viewBox attribute when possible (disabled by default)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "cleanupEnableBackground",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove or cleanup enable-background attribute when possible"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "minifyStyles",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("minify <style> elements content with CSSO"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "convertStyleToAttrs",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("convert styles into attributes"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "convertColors",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("convert colors (from rgb() to #rrggbb, from #rrggbb to #rgb)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "convertPathData",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("convert Path data to relative or absolute (whichever is shorter), convert one segment to another, trim useless delimiters, smart rounding, and much more"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "convertTransform",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("collapse multiple transforms into one, convert matrices to the short aliases, and much more"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeUnknownsAndDefaults",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove unknown elements content and attributes, remove attrs with default values"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeNonInheritableGroupAttrs",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove non-inheritable group's 'presentation' attributes"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeUselessStrokeAndFill",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove useless stroke and fill attrs"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeUnusedNS",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove unused namespaces declaration"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "cleanupIDs",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove unused and minify used IDs"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "cleanupNumericValues",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("round numeric values to the fixed precision, remove default px units"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "cleanupListOfValues",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("round numeric values in attributes that take a list of numbers (like viewBox or enableBackground)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "moveElemsAttrsToGroup",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("move elements' attributes to their enclosing group"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "moveGroupAttrsToElems",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("move some group attributes to the contained elements"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "collapseGroups",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("collapse useless groups"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeRasterImages",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove raster images (disabled by default)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "mergePaths",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("merge multiple Paths into one"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "convertShapeToPath",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("convert some basic shapes to <path>"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "sortAttrs",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("sort element attributes for epic readability (disabled by default)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "transformsWithOnePath",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("apply transforms, crop by real width, center vertical alignment, and resize SVG with one Path inside (disabled by default)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeDimensions",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove width/height attributes if viewBox is present (disabled by default)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeAttrs",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove attributes by pattern (disabled by default)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeElementsByAttr",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove arbitrary elements by ID or className (disabled by default)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "addClassesToSVGElement",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("add classnames to an outer <svg> element (disabled by default)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "addAttributesToSVGElement",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("adds attributes to an outer <svg> element (disabled by default)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "removeStyleElement",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("remove <style> elements (disabled by default)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							}
						]
					}
				]
			},
			{
				"fileType" : "GIF",
				"active" : ko.observable(false),
				"activePlugin" : ko.observable("gifsicle"),
				"plugins" : [
					{
						"pluginName" : "gifsicle",
						"settings" : [
							{
								"setting" : "interlaced",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Interlace gif for progressive rendering."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "optimizationLevel",
								"type" : ko.observable("checkbox-dropdown"),
								"title" : ko.observable("Select an optimization level between 1 and 3.  \n\nThe optimization level determines how much optimization is done; higher levels take longer, but may have better results.  \n\nStores only the changed portion of each image. \nAlso uses transparency to shrink the file further. \nTry several optimization methods (usually slower, sometimes better results)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray([1, 2, 3]),
								"dropdownSelection" : ko.observable(1)
							},
							{
								"setting" : "colors",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Reduce the number of distinct colors in each output GIF to num or less. Num must be between 2 and 256."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(256),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							}
						]
					},
					{
						"pluginName" : "giflossy",
						"settings" : [
							{
								"setting" : "interlaced",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Interlace gif for progressive rendering."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "optimizationLevel",
								"type" : ko.observable("checkbox-dropdown"),
								"title" : ko.observable("Select an optimization level between 1 and 3. \n\nThe optimization level determines how much optimization is done; higher levels take longer, but may have better results. \n\nStores only the changed portion of each image. \nAlso uses transparency to shrink the file further. \nTry several optimization methods (usually slower, sometimes better results)"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray([1, 2, 3]),
								"dropdownSelection" : ko.observable(1)
							},
							{
								"setting" : "colors",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Reduce the number of distinct colors in each output GIF to num or less. Num must be between 2 and 256."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(256),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "lossy",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Order pixel patterns to create smaller GIFs at cost of artifacts and noise.\n\nAdjust lossy argument to quality you want (30 is very light compression, 200 is heavy).\n\nIt works best when only little loss is introduced, and due to limitation of the compression algorithm very high loss levels won't give as much gain."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(80),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "resize",
								"type" : ko.observable("checkbox-text"),
								"title" : ko.observable("Resize the output GIF to widthxheight.\n\ne.g.:\n\nimageminGiflossy({ resize: '300x200' });"),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable("300x200"),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "noLogicalScreen",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Sets the output logical screen to the size of the largest output frame."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "resizeMethod",
								"type" : ko.observable("checkbox-dropdown"),
								"title" : ko.observable("Set the method used to resize images."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(),
								"dropdownSelection" : ko.observable()
							},
							{
								"setting" : "colorMethod",
								"type" : ko.observable("checkbox-dropdown"),
								"title" : ko.observable("Determine how a smaller colormap is chosen."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(["mix", "sample"]),
								"dropdownSelection" : ko.observable("mix")
							},
							{
								"setting" : "optimize",
								"type" : ko.observable("checkbox-dropdown"),
								"title" : ko.observable("Optimize output GIF animations for space.\n\nThere are currently three levels:\n\n1: Stores only the changed portion of each image. This is the default.\n2: Also uses transparency to shrink the file further.\n3: Try several optimization methods (usually slower, sometimes better results)."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray(["diversity", "blend-diversity"]),
								"dropdownSelection" : ko.observable("diversity")
							},
							{
								"setting" : "unoptimize",
								"type" : ko.observable("checkbox"),
								"title" : ko.observable("Unoptimize GIF animations into an easy-to-edit form."),
								"checkbox" : ko.observable(false),
								"textValue" : ko.observable(),
								"dropdownOptions" : ko.observableArray([1, 2, 3]),
								"dropdownSelection" : ko.observable(1)
							}
						]
					}
				]
			}
		];
	}
    
    module.exports = ImageminSettings;
})();