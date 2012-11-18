//
//  Copyright (c) 2011 Finnbarr P. Murphy.  All rights reserved.
//

const Main = imports.ui.main;
const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;

const PANEL_ICON_SIZE = 24; 


function Gnote() {
    this._init()
}

Gnote.prototype = {
    _init: function() {
        this._moved = false;
    },

    enable: function() {
        if (this._moved == true) return;

        for (let i = 0; i < Main.messageTray._summaryItems.length; i++ ) {
            if (Main.messageTray._summaryItems[i]._sourceTitle.text == 'gnote') {
                let _icon = Main.messageTray._summaryItems[i].source._trayIcon;
                 _icon.height = PANEL_ICON_SIZE;

                let _child = Main.messageTray._summaryItems[i].actor.child;
                Main.messageTray._summaryItems[i].actor.remove_actor(_child);

                let buttonBox = new PanelMenu.ButtonBox();
                let box = buttonBox.actor;

                Main.panel._rightBox.insert_actor(box, 0);
                box._rolePosition = 0;
                box.add_actor(_icon);
                _icon.reparent(box);

                this._moved = true;
                Main.panel._rightBox.show();
            }
        }
    },

    disable: function() {
       this._moved = false;
    } 
};


function init() {
    return new Gnote();
}
