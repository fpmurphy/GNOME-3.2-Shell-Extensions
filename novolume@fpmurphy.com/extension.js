//
//  Copyright (c) 2011  Finnbarr P. Murphy.   All rights reserved.
//

const Panel = imports.ui.main.panel;


function NoVolume() {
    this._init();
}

NoVolume.prototype = {
    _init: function() {
	this.volume = Panel._statusArea.volume;
    },

    enable: function() {
        this.volume.actor.hide();
    },

    disable: function() {
        this.volume.actor.show();
    }
};

function init(extensionMeta) {
    return new NoVolume();
}
