//
//  Copyright (c) 2011  Finnbarr P. Murphy.  All rights reserved.
//

const St = imports.gi.St;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;
const UserMenu = imports.ui.userMenu;

const Gettext = imports.gettext.domain('gnome-shell');
const _ = Gettext.gettext;


function ChangeUserMenu() {
    this._init();
}

ChangeUserMenu.prototype = {

    _init: function () {
        this.userMenu = Main.panel._statusArea.userMenu;
        this.oldMenuItem = this.userMenu._suspendOrPowerOffItem;
        this.oldUpdate = this.userMenu._updateSuspendOrPowerOff; 

        this.newMenuItem = new PopupMenu.PopupAlternatingMenuItem(_("Power Off..."), _("Suspend"));
        this.newMenuItem.connect('activate', Lang.bind(this, this._onSuspendOrPowerOffActivate)); 
        this.newMenuItem.actor.hide();
        this.userMenu.menu.addMenuItem(this.newMenuItem);
    },

    enable: function() {
        this.userMenu._suspendOrPowerOffItem = this.newMenuItem;
        this.userMenu._updateSuspendOrPowerOff = this._updateSuspendOrPowerOff;

        this.newMenuItem.actor.show();
        this.oldMenuItem.actor.hide();
    },

    disable: function() {
        this.userMenu._suspendOrPowerOffItem = this.oldMenuItem;
        this.userMenu._updateSuspendOrPowerOff = this.oldUpdate;
   
        this.newMenuItem.actor.hide();
        this.oldMenuItem.actor.show();
    },

    _updateSuspendOrPowerOff: function() {
        this.userMenu._haveSuspend = this.userMenu._upClient.get_can_suspend();

        if (!this.userMenu._suspendOrPowerOffItem)
            return;

        if (!this.userMenu._haveShutdown && !this.userMenu._haveSuspend)
            this.userMenu._suspendOrPowerOffItem.actor.hide();
        else
            this.userMenu._suspendOrPowerOffItem.actor.show();

        if (!this.userMenu._haveShutdown) {
            this.userMenu._suspendOrPowerOffItem.updateText(_("Suspend"), null);
        } else if (!this.userMenu._haveSuspend) {
            this.userMenu._suspendOrPowerOffItem.updateText(_("Power Off..."), null);
        } else {
            this.userMenu._suspendOrPowerOffItem.updateText(_("Power Off..."), _("Suspend"));
        }
    },

    _onSuspendOrPowerOffActivate: function() {
        Main.overview.hide();

        if (this.userMenu._haveSuspend &&
            this.userMenu._suspendOrPowerOffItem.state == PopupMenu.PopupAlternatingMenuItemState.ALTERNATIVE) {
            this.userMenu._screenSaverProxy.SetActiveRemote(true, Lang.bind(this, function() {
                this.userMenu._upClient.suspend_sync(null);
            }));
        } else {
            this.userMenu._session.ShutdownRemote();
        }
    }

};


function init(extensionMeta) {
    return new ChangeUserMenu();
}
