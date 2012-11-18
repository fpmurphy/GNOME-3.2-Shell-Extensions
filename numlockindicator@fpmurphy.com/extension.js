//
//  Copyright (c) 2011  Finnbarr P. Murphy.  All rights reserved.
//

const Lang = imports.lang;
const Gdk = imports.gi.Gdk;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;


function NumLockIndicator(path) {
    this._init.apply(this, arguments);
}

NumLockIndicator.prototype = {
     __proto__: PanelMenu.ButtonBox.prototype,

    _init: function(iconpath) {
         PanelMenu.ButtonBox.prototype._init.call(this, {reactive: false});

         let textureCache = St.TextureCache.get_default();
         this._iconNumLockOn = textureCache.load_uri_async("file://" + iconpath + "/numlock-on.svg", -1, -1);
         this._iconNumLockOff = textureCache.load_uri_async("file://" + iconpath + "/numlock-off.svg", -1, -1);
 
         this._box = new St.BoxLayout({ name: 'numIndicatorIcon' });
         this._iconBox = new St.Bin();
         this._iconBox = new St.Bin({ style_class: 'numlock-status-indicator',
                                      child: this._iconNumLockOff });
         this._box.add(this._iconBox, { y_align: St.Align.MIDDLE, y_fill: false });
         this.actor.add_actor(this._box);

         this._keymap = Gdk.Keymap.get_for_display(Gdk.Display.get_default());
         this._keymap.connect('state-changed', Lang.bind(this, this._keymapStateChange));
    },

    _keymapStateChange: function() {
        this._setNumLockIcon();
    },

    _setNumLockIcon: function() {
        if (this._keymap.get_num_lock_state()) {
            this._iconBox.set_child(this._iconNumLockOn);
            this.actor.tooltip_text = "Numlock is ON";
        } else {
            this._iconBox.set_child(this._iconNumLockOff);
            this.actor.tooltip_text = "Numlock is OFF";
        }
    },

    enable: function() {
        this._setNumLockIcon();
        Main.panel._rightBox.insert_actor(this.actor, 1);
    },

    disable: function() {
        Main.panel._rightBox.remove_actor(this.actor);
    }
};

function init(extensionMeta) {
    return new NumLockIndicator(extensionMeta.path);
}

