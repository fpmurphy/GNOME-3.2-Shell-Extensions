//
//  Copyright 2011 (c) Finnbarr P. Murphy.  All rights reserved.
//

const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;

const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;
const Signals = imports.signals;


function DualActionButton(menuAlignment) {
    this._init(menuAlignment);
}

DualActionButton.prototype = {
    __proto__: PanelMenu.ButtonBox.prototype,

    _init: function(menuAlignment) {
        PanelMenu.ButtonBox.prototype._init.call(this, { reactive: true,
                                               can_focus: true,
                                               track_hover: true });

        this.actor.connect('button-press-event', Lang.bind(this, this._onButtonPress));
        this.actor.connect('key-press-event', Lang.bind(this, this._onSourceKeyPress));

        this.menuL = new PopupMenu.PopupMenu(this.actor, menuAlignment, St.Side.TOP);
        this.menuL.actor.add_style_class_name('panel-menu');
        this.menuL.connect('open-state-changed', Lang.bind(this, this._onOpenStateChanged));
        this.menuL.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
        Main.uiGroup.add_actor(this.menuL.actor);
        this.menuL.actor.hide();

        this.menuR = new PopupMenu.PopupMenu(this.actor, menuAlignment, St.Side.TOP);
        this.menuR.actor.add_style_class_name('panel-menu');
        this.menuR.connect('open-state-changed', Lang.bind(this, this._onOpenStateChanged));
        this.menuR.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
        Main.uiGroup.add_actor(this.menuR.actor);
        this.menuR.actor.hide();
    },

    _onButtonPress: function(actor, event) {
        let button = event.get_button();
        if (button == 1) { 
            if (this.menuL.isOpen) {
                this.menuL.close();
            } else {
                if (this.menuR.isOpen) 
                    this.menuR.close();
                this.menuL.open();
            }
        } else if (button == 3) {
            if (this.menuR.isOpen) {
                this.menuR.close();
            } else {
                if (this.menuL.isOpen) 
                    this.menuL.close();
                this.menuR.open();
            }
        }
    },

    _onSourceKeyPress: function(actor, event) {
        let symbol = event.get_key_symbol();
        if (symbol == Clutter.KEY_space || symbol == Clutter.KEY_Return) {
            if (this.menuL.isOpen) {
                this.menuL.close();
            } else if (this.menuR.isOpen) { 
                this.menuR.close();
            }
            return true;
        } else if (symbol == Clutter.KEY_Escape) {
            if (this.menuL.isOpen) 
                this.menuL.close();
            if (this.menuR.isOpen) 
                this.menuR.close();
            return true;
        } else
            return false;
    },

    _onMenuKeyPress: function(actor, event) {
        let symbol = event.get_key_symbol();
        if (symbol == Clutter.KEY_Left || symbol == Clutter.KEY_Right) {
            let focusManager = St.FocusManager.get_for_stage(global.stage);
            let group = focusManager.get_group(this.actor);
            if (group) {
                let direction = (symbol == Clutter.KEY_Left) ? Gtk.DirectionType.LEFT : Gtk.DirectionType.RIGHT;
                group.navigate_focus(this.actor, direction, false);
                return true;
            }
        }
        return false;
    },

    _onOpenStateChanged: function(menu, open) {
        if (open)
            this.actor.add_style_pseudo_class('active');
        else
            this.actor.remove_style_pseudo_class('active');
    },

    destroy: function() {
        this.actor._delegate = null;
        this.menuL.destroy();
        this.menuR.destroy();
        this.actor.destroy();
        this.emit('destroy');
    },

};
Signals.addSignalMethods(DualActionButton.prototype);



function DemoDualActionButton() {
   this._init();
}

DemoDualActionButton.prototype = {
    __proto__: DualActionButton.prototype,
   
    _init: function() {
        DualActionButton.prototype._init.call(this, 0.0);
      
        this._iconActor = new St.Icon({ icon_name: 'start-here',
                                        icon_type: St.IconType.SYMBOLIC,
                                        style_class: 'system-status-icon' });
        this.actor.add_actor(this._iconActor);
        this.actor.add_style_class_name('panel-status-button');

        let item = new PopupMenu.PopupMenuItem(_("Left Menu Item 1"));
        this.menuL.addMenuItem(item);
        item = new PopupMenu.PopupMenuItem(_("Left Menu Item 2"));
        this.menuL.addMenuItem(item);

        item = new PopupMenu.PopupMenuItem(_("Right Menu Item 1"));
        this.menuR.addMenuItem(item);
        item = new PopupMenu.PopupMenuItem(_("Right Menu Item 2"));
        this.menuR.addMenuItem(item);
        item = new PopupMenu.PopupMenuItem(_("Right Menu Item 3"));
        this.menuR.addMenuItem(item);
        item = new PopupMenu.PopupMenuItem(_("Right Menu Item 4"));
        this.menuR.addMenuItem(item);
    },
   
    enable: function() {
        Main.panel._centerBox.add(this.actor, { y_fill: true });
        Main.panel._menus.addMenu(this.menuL);
        Main.panel._menus.addMenu(this.menuR);
    },

    disable: function() {
        Main.panel._centerBox.remove_actor(this.actor);
        Main.panel._menus.removeMenu(this.menuL);
        Main.panel._menus.removeMenu(this.menuR);
    },
};


function init() {
    return new DemoDualActionButton();
}



