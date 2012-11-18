//
//  Copyright (c) 2011 Finnbarr P. Murphy.  All rights reserved.
//

const Main = imports.ui.main;

function NoHotCorner() {
    this._init.apply(this, arguments);
}

NoHotCorner.prototype = {
    _init: function() {
        this._hotCorner = Main.panel._activitiesButton._hotCorner;
    },

    enable: function() {
        this._hotCorner._corner.hide();
    },

    disable: function() {
        this._hotCorner._corner.show();
    }
};

function init(extensionMeta) {
    return new NoHotCorner();
}

