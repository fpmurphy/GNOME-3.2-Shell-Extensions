//
//  Copyright (c) 2011  Finnbarr P. Murphy.  All rights reserved.
//

const Lang = imports.lang;
const Gdk = imports.gi.Gdk;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;


function CapNumLockIndicator(path) {
    this._init.apply(this, arguments);
}

CapNumLockIndicator.prototype = {
     __proto__: PanelMenu.ButtonBox.prototype,

    _init: function(iconpath) {
         PanelMenu.ButtonBox.prototype._init.call(this, {reactive: false});

         let textureCache = St.TextureCache.get_default();
         this._iconCapsOn = textureCache.load_uri_async("file://" + iconpath + "/capslock-on.svg", -1, -1);
         this._iconCapsOff = textureCache.load_uri_async("file://" + iconpath + "/capslock-off.svg", -1, -1);
         this._iconNumOn = textureCache.load_uri_async("file://" + iconpath + "/numlock-on.svg", -1, -1);
         this._iconNumOff = textureCache.load_uri_async("file://" + iconpath + "/numlock-off.svg", -1, -1);
 
         this._box = new St.BoxLayout({ name: 'capnumIndicatorIcon' });
         this._iconBoxC = new St.Bin({ style_class: 'capnumlock-status-indicator',
                                       child: this._iconCapsOff });
         this._box.add(this._iconBoxC);
         this._iconBoxN = new St.Bin({ style_class: 'capnumlock-status-indicator',
                                       child: this._iconNumOff });
         this._box.add(this._iconBoxN);
         this.actor.add_actor(this._box);

         this._keymap = Gdk.Keymap.get_for_display(Gdk.Display.get_default());
         this._keymap.connect('state-changed', Lang.bind(this, this._keymapStateChange));
    },

    _keymapStateChange: function() {
        this._setCapNumLockIcon();
    },

    _setCapNumLockIcon: function() {
        let capslock = this._keymap.get_caps_lock_state();
        let numlock = this._keymap.get_num_lock_state();

        if (capslock && numlock) {
            this._iconBoxC.set_child(this._iconCapsOn);
            this._iconBoxN.set_child(this._iconNumOn);
            this.actor.tooltip_text = "Capslock ON, Numlock ON";
        } else if (capslock && !numlock) {
            this._iconBoxC.set_child(this._iconCapsOn);
            this._iconBoxN.set_child(this._iconNumOff);
            this.actor.tooltip_text = "Capslock ON, Numlock OFF";
        } else if (!capslock && numlock) {
            this._iconBoxC.set_child(this._iconCapsOff);
            this._iconBoxN.set_child(this._iconNumOn);
            this.actor.tooltip_text = "Capslock OFF, Numlock ON";
        } else {
            this._iconBoxC.set_child(this._iconCapsOff);
            this._iconBoxN.set_child(this._iconNumOff);
            this.actor.tooltip_text = "Capslock OFF, Numlock OFF";
        }
    },

    enable: function() {
        this._setCapNumLockIcon();
        Main.panel._rightBox.insert_actor(this.actor, 1);
    },

    disable: function() {
        Main.panel._rightBox.remove_actor(this.actor);
    }
};

function init(extensionMeta) {
    return new CapNumLockIndicator(extensionMeta.path);
}
