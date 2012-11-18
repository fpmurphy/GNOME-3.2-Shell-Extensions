//
//  Copyright (c)  Finnbarr P. Murphy.  All rights preserved.
//

const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const LookingGlass = imports.ui.lookingGlass;


function LookingGlassButton() {
    this._init();
}

LookingGlassButton.prototype = {
    _lookingGlass: null,
    _button: null,

    _init: function() {

        this._button = new St.BoxLayout({ name: 'looking-glass-button',
                                          style_class: 'looking-glass-button' });

        let icon = new St.Icon({ icon_name: 'gtk-color-picker',
                                 icon_type: St.IconType.FULLCOLOR,
                                 icon_size: 24 });

        icon.reactive = true;
        icon.connect('button-press-event', Lang.bind(this, function () {
            if (this._lookingGlass != null ) {
                this._button.remove_style_class_name('looking-glass-button-active');
                this._lookingGlass.close();
                this._lookingGlass = null;
            } else {
                this._button.add_style_class_name('looking-glass-button-active');
                this._lookingGlass = new LookingGlass.LookingGlass();
                this._lookingGlass.open();
                this._lookingGlass.connect('destroy', Lang.bind(this, this._fixup));
                Main.lookingGlass = this._lookingGlass; 
            }
            return true;
        }));

        this._button.add_actor(icon);
        this._button.set_tooltip_text('Looking Glass');

    },
    
    // see the README
    _fixup : function(actor, event) {
         this._button.remove_style_class_name('looking-glass-button-active');
         this._lookingGlass = null;
         return false;
    },

    enable: function() {
        let _children = Main.panel._leftBox.get_children();
        Main.panel._leftBox.insert_actor(this._button, _children.length - 1);
    },

    disable: function() {
        this._button.get_parent().remove_actor(this._button);
    },


};


function init() {
    return new LookingGlassButton();
}
