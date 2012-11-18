//
//  Copyright (c) 2011 Finnbarr P.Murphy.  All rights reserved.
//

const Main = imports.ui.main;

function NoCalendar() {
    this._init.apply(this, arguments);
}

NoCalendar.prototype = {
    _init: function() {
        this.dateMenu = Main.panel._dateMenu;
    },

    enable: function() {
        this.dateMenu.actor.reactive = false;
    },

    disable: function() {
        this.dateMenu.actor.reactive = true;
    }
};

function init(extensionMeta) {
    return new NoCalendar();
}
