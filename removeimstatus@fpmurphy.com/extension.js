//
//  Copyright (c) 2011  Finnbarr P. Murphy.  All rights reserved.
//

const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const UserMenu = imports.ui.userMenu;

const Gettext = imports.gettext.domain('gnome-shell');
const _ = Gettext.gettext;


function ChangeUserMenu() {
    this._init();
}

ChangeUserMenu.prototype = {

    _init: function () {
        this.userMenu = Main.panel._statusArea.userMenu;
    },

    enable: function() {
        this.userMenu._iconBox.hide();

        let children = this.userMenu.menu._getMenuItems();
        for (let i = 0; i < children.length; i++) {
            let item = children[i];
            if ( item instanceof UserMenu.IMStatusChooserItem) {
                item.actor.hide();
            } else if (item instanceof PopupMenu.PopupMenuItem) {
                if (item.label.text == _("Online Accounts")) {
                    item.actor.hide();
                }
            } else if (item instanceof PopupMenu.PopupSwitchMenuItem) {
                item.actor.hide();
            }
        }            
    },

    disable: function() {
        this.userMenu._iconBox.show();

        let children = this.userMenu.menu._getMenuItems();
        for (let i = 0; i < children.length; i++) {
            let item = children[i];
            if ( item instanceof UserMenu.IMStatusChooserItem) {
                item.actor.show();
            } else if (item instanceof PopupMenu.PopupMenuItem) {
                if (item.label.text == _("Online Accounts")) {
                    item.actor.show();
                }
            } else if (item instanceof PopupMenu.PopupSwitchMenuItem) {
                item.actor.show();
            }
        }            
    }

};


function init(extensionMeta) {
    return new ChangeUserMenu();
}
