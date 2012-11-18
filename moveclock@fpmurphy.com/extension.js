//
//  Copyright (c) 2011 Finnbarr P.Murphy.  All rights reserved.
//

const Main = imports.ui.main;

function MoveClock() {
    this._init.apply(this, arguments);
}

MoveClock.prototype = {
    _init: function() {
        this.dateMenu = Main.panel._dateMenu;
    },

    enable: function() {
        let children = Main.panel._rightBox.get_children();
        Main.panel._centerBox.remove_actor(this.dateMenu.actor);
        Main.panel._rightBox.insert_actor(this.dateMenu.actor, children.length - 1);
    },

    disable: function() {
        Main.panel._rightBox.remove_actor(this.dateMenu.actor);
        Main.panel._centerBox.add_actor(this.dateMenu.actor);
    }
};

function init(extensionMeta) {
    return new MoveClock();
}
