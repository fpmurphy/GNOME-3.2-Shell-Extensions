//
//  Copyright (c) 2011  Finnbarr P. Murphy.  All rights reserved.
//

const Lang = imports.lang;
const Gdk = imports.gi.Gdk;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;


function CapsLockIndicator(path) {
    this._init.apply(this, arguments);
}

CapsLockIndicator.prototype = {
     __proto__: PanelMenu.ButtonBox.prototype,

    _init: function(iconpath) {
         PanelMenu.ButtonBox.prototype._init.call(this, {reactive: false});

         let textureCache = St.TextureCache.get_default();
         this._iconCapsLockOn = textureCache.load_uri_async("file://" + iconpath + "/capslock-on.svg", -1, -1);
         this._iconCapsLockOff = textureCache.load_uri_async("file://" + iconpath + "/capslock-off.svg", -1, -1);
 
         this._box = new St.BoxLayout({ name: 'capsIndicatorIcon' });
         this._iconBox = new St.Bin();
         this._iconBox = new St.Bin({ style_class: 'capslock-status-indicator',
                                      child: this._iconCapsLockOff });
         this._box.add(this._iconBox, { y_align: St.Align.MIDDLE, y_fill: false });
         this.actor.add_actor(this._box);

         this._keymap = Gdk.Keymap.get_for_display(Gdk.Display.get_default());
         this._keymap.connect('state-changed', Lang.bind(this, this._keymapStateChange));
    },

    _keymapStateChange: function() {
        this._setCapsLockIcon();
    },

    _setCapsLockIcon: function() {
        if (this._keymap.get_caps_lock_state()) {
            this._iconBox.set_child(this._iconCapsLockOn);
            this.actor.tooltip_text = "Capslock is ON";
        } else {
            this._iconBox.set_child(this._iconCapsLockOff);
            this.actor.tooltip_text = "Capslock is OFF";
        }
    },

    enable: function() {
        this._setCapsLockIcon();
        Main.panel._rightBox.insert_actor(this.actor, 1);
    },

    disable: function() {
        Main.panel._rightBox.remove_actor(this.actor);
    }
};

function init(extensionMeta) {
    return new CapsLockIndicator(extensionMeta.path);
}

