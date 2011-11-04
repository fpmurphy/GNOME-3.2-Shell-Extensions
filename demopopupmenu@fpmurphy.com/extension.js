//
// Copyright (c) 2011 Finnbarr P. Murphy.  All rights reserved.
//

const St = imports.gi.St;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Panel = imports.ui.panel;
const Main = imports.ui.main;


function DemoButton() {
   this._init();
}

DemoButton.prototype = {
    __proto__: PanelMenu.SystemStatusButton.prototype,
   
    _init: function() {
        PanelMenu.SystemStatusButton.prototype._init.call(this, 'folder');
      
        let item = new PopupMenu.PopupMenuItem(_("Hello"));
        this.menu.addMenuItem(item);
        item = new PopupMenu.PopupMenuItem(_("Goodbye"));
        this.menu.addMenuItem(item);
    },
   
    enable: function() {
        let _children = Main.panel._rightBox.get_children();
        Main.panel._rightBox.insert_actor(this.actor, _children.length - 1);
        Main.panel._menus.addMenu(this.menu);
    },

    disable: function() {
        Main.panel._menus.removeMenu(this.menu);
        Main.panel._rightBox.remove_actor(this.actor);
    }
}


function init() {
    return new DemoButton();
}

