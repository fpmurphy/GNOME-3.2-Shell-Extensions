//
//  Copyright (c) 2011  Finnbarr P. Murphy.  All rights reserved.
//

const Main = imports.ui.main;


function ChangeUserMenu() {
    this._init();
}

ChangeUserMenu.prototype = {

    _init: function () {
        this.userMenu = Main.panel._statusArea.userMenu;
    },

    enable: function() {
        this.userMenu._name.hide();
    },

    disable: function() {
        this.userMenu._name.show();
    }

};


function init(extensionMeta) {
    return new ChangeUserMenu();
}
