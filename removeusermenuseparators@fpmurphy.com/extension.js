//
//  Copyright (c) 2011  Finnbarr P. Murphy.  All rights reserved.
//

const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;


function ChangeUserMenu() {
    this._init();
}

ChangeUserMenu.prototype = {

    _init: function () {
        this.userMenu = Main.panel._statusArea.userMenu.menu;
        this.oldFunc = this.userMenu._updateSeparatorVisibility;
    },

    enable: function() {
        this.userMenu._updateSeparatorVisibility = this._updateSeparatorVisibility;
        let children = this.userMenu._getMenuItems();
        for (let i = 0; i < children.length; i++) {
            let item = children[i];
            if (item instanceof PopupMenu.PopupSeparatorMenuItem) {
               item.actor.hide();
            }
        }            
    },

    disable: function() {
        this.userMenu._updateSeparatorVisibility = this.oldFunc;
        let children = this.userMenu._getMenuItems();
        for (let i = 0; i < children.length; i++) {
            let item = children[i];
            if (item instanceof PopupMenu.PopupSeparatorMenuItem) {
               item.actor.show();
            }
        }            
    },

    _updateSeparatorVisibility: function(menuItem) {
         menuItem.actor.hide();
    }
};


function init(extensionMeta) {
    return new ChangeUserMenu();
}
