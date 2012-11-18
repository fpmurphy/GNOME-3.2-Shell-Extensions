//
//  Copyright (c) 2011 Finnbarr P. Murphy.   All rights reserved.
//

const St = imports.gi.St;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;


function WorkspaceButton(metadata) {
   this._init(metadata);
}

WorkspaceButton.prototype = {
    __proto__: PanelMenu.Button.prototype,
   
    _init: function(metadata) {
        PanelMenu.Button.prototype._init.call(this, null);
      
        this._label = new St.Label({ text: (global.screen.get_active_workspace().index() + 1).toString(), style_class: 'workspaces-button'});
        this.actor.add_actor(this._label);

        global.screen.connect_after('workspace-switched', Lang.bind(this, this._updateWorkspaceButton));
    },
   
    enable: function() {
        let section = new PopupMenu.PopupMenuSection();

        this.workspaceMenuItems = [];
      
        for (let i = 0; i < global.screen.n_workspaces; i++) {
            this.workspaceMenuItems[i] = new PopupMenu.PopupMenuItem((i + 1).toString());
            section.addMenuItem(this.workspaceMenuItems[i]);
            this.workspaceMenuItems[i].workspaceId = i;
            this.workspaceMenuItems[i].label_actor = this._label;
            this.workspaceMenuItems[i].connect('activate', function(actor, event) {
                let _workspace = global.screen.get_workspace_by_index(actor.workspaceId);
                _workspace.activate(true);
                actor.label_actor.set_text((global.screen.get_active_workspace().index() + 1).toString());
            });
         }

         this.menu.addMenuItem(section);
         this.menu.actor.add_style_class_name('workspaces-menu')
         this.menu.actor.remove_style_class_name('popup-menu');

         let _children = Main.panel._rightBox.get_children();
         Main.panel._rightBox.insert_actor(this.actor, _children.length - 1);
         Main.panel._menus.addMenu(this.menu);
    },

    disable: function() {
        Main.panel._rightBox.remove_actor(this.actor);    
        Main.panel._menus.removeMenu(this.menu);    
    },

    _updateWorkspaceButton: function(a, e){
        this._label.set_text((global.screen.get_active_workspace().index() + 1).toString());
    }
}

function init(metadata) {
    return new WorkspaceButton(metadata);
}

