//
//  Copyright 2011 (c) Finnbarr P. Murphy.  All rights reserved.
//

const Main = imports.ui.main;
const St = imports.gi.St;


function ColorStatusButtonsExtension() {
    this._init()
}


ColorStatusButtonsExtension.prototype = {
    _init: function() {
        this._fullcolor = null;
    },

    disable: function() {
        let children = Main.panel._rightBox.get_children();
        for (let i = 0; i < children.length; i++) {
            if (children[i] && children[i]._delegate._iconActor) {
                children[i]._delegate._iconActor.icon_type = St.IconType.SYMBOLIC;
                children[i]._delegate._iconActor.style_class = 'system-status-icon';
            }
        }
    },

    enable: function() {
        let children = Main.panel._rightBox.get_children();
        for (let i = 0; i < children.length; i++) {
            if (children[i] && children[i]._delegate._iconActor) {
                children[i]._delegate._iconActor.icon_type = St.IconType.FULLCOLOR;
                children[i]._delegate._iconActor.style_class = 'color-status-button';
            }
        }
    }
};


function init() {
    return new ColorStatusButtonsExtension(); 
}
