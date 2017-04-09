/*
 *
 *  iom - Main Menu
 *  Author: Javier Aroche
 *
 */

;(function() {
    
    'use strict';

    const { remote, ipcRenderer } = require('electron');
    const { Menu, MenuItem } = remote;

   /*
    * Main Menu constructor.
    * @constructor
    * @param {Context<Object>} The context where the Menu is attached to.
    *                          In this case to the KO ViewModel.
    */
    function MainMenu(context) {
        var self = context;

        this.iomMenu = [
            {
                label: 'iom',
                submenu : [
                    {
                        label: 'About iom',
                        selector: 'orderFrontStandardAboutPanel:'
                    },
                    {
                        label: 'Settings',
                        click: function() {
                            self.setSettingsOverlay();
                        }
                    },
                    {
                        label: 'Check for Updates...',
                        accelerator: 'Command+U',
                        click: function() {
                            ipcRenderer.send('request-update');
                        }
                    },                    
                    {
                        type: 'separator'
                    },             
                    {
                        label: 'Quit iom',
                        accelerator: 'Command+Q',
                        selector: 'terminate:'
                    }  
                ]
            }                       
        ];

        this.menu = Menu.buildFromTemplate(this.iomMenu);
		// Expose menu items
        this.settingsMenuItem = this.menu.items[0].submenu.items[1];
        this.checkForUpdatesMenuItem = this.menu.items[0].submenu.items[2];
		
        Menu.setApplicationMenu(this.menu);
    }
    
    module.exports = MainMenu;
})();