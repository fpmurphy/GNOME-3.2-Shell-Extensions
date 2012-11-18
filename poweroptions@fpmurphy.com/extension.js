//
//  Copyright (c) 2011 Finnbarr P. Murphy.  All rights reserved.
//

const St = imports.gi.St;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;

const Gettext = imports.gettext.domain('gnome-shell');
const _ = Gettext.gettext;


function onSuspendActivate(item) {
    Main.overview.hide();

    this._screenSaverProxy.LockRemote(Lang.bind(this, function() {
        this._upClient.suspend_sync(null);
    }));
}

function onHibernateActivate(item) {
    Main.overview.hide();

    this._screenSaverProxy.LockRemote(Lang.bind(this, function() {
        this._upClient.hibernate_sync(null);
    }));
}


function ChangeUserMenu() {
    this._init();
}

ChangeUserMenu.prototype = {

    _init: function () {
        this.userMenu = Main.panel._statusArea.userMenu;

        this.poweroffMenuItem = null;
        this.hibernateMenuItem = null;
        this.suspendMenuItem = null;

        this.suspendSignalId = 0
        this.hibernateSignalId = 0;
    },

    enable: function() {
        let children = this.userMenu.menu._getMenuItems();

        let index = 0;
        for (let i = children.length - 1; i >= 0; i--) {
            if (children[i] == this.userMenu._suspendOrPowerOffItem) {
                children[i].destroy();
                index = i;
                break;
            }
        }
        if (index == 0) return;

        this.suspendMenuItem = new PopupMenu.PopupMenuItem(_("Suspend"));
        this.suspendMenuItem.connect('activate', Lang.bind(this.userMenu, onSuspendActivate));
        this.suspendSignalId = this.userMenu._upClient.connect('notify::can-suspend', 
             Lang.bind(this.userMenu, this.updateSuspend, this.suspendMenuItem));
        this.updateSuspend(this.userMenu._upClient, null, this.suspendMenuItem);
        this.userMenu.menu.addMenuItem(this.suspendMenuItem, index);

        this.hibernateMenuItem = new PopupMenu.PopupMenuItem(_("Hibernate"));
        this.hibernateMenuItem.connect('activate', Lang.bind(this.userMenu, onHibernateActivate));
        this.hibernateSignalId = this.userMenu._upClient.connect('notify::can-hibernate', 
             Lang.bind(this.userMenu, this.updateHibernate, this.hibernateMenuItem));
        this.updateHibernate(this.userMenu._upClient, null, this.hibernateMenuItem);
        this.userMenu.menu.addMenuItem(this.hibernateMenuItem, index+1);

        this.poweroffMenuItem = new PopupMenu.PopupMenuItem(_("Power Off..."));
        this.poweroffMenuItem.actor.add_style_pseudo_class('alternate');
        this.poweroffMenuItem.connect('activate', Lang.bind(this.userMenu, function() {
             this._session.ShutdownRemote();
        }));
        this.userMenu.menu.addMenuItem(this.poweroffMenuItem, index+2);

        this.userMenu._suspendOrPowerOffItem = null;
    },

    disable: function() {
        let children = this.userMenu.menu._getMenuItems();

        let index = 0;
        for (let i = children.length - 1; i >= 0; i--) {
            if (children[i] == this.suspendMenuItem) {
                index = i;
                break;
            }
        }
        if (index == 0) return;

        this.userMenu._upClient.disconnect(this.suspendSignalId);
        this.userMenu._upClient.disconnect(this.hibernateSignalId);

        this.suspendMenuItem.destroy();
        this.hibernateMenuItem.destroy();
        this.poweroffMenuItem.destroy();

        let menuItem = new PopupMenu.PopupAlternatingMenuItem("", "");
        this.userMenu._suspendOrPowerOffItem = menuItem;
        this.userMenu.menu.addMenuItem(menuItem, index);
        menuItem.connect('activate',
            Lang.bind(this.userMenu, this.userMenu._onSuspendOrPowerOffActivate));
        this.userMenu._updateSuspendOrPowerOff();
    },

    updateSuspend: function(object, pspec, item) {
        item.actor.visible = object.get_can_suspend();
    },

    updateHibernate: function(object, pspec, item) {
        item.actor.visible = object.get_can_hibernate();
    },

};


function init(extensionMeta) {
    return new ChangeUserMenu();
}
