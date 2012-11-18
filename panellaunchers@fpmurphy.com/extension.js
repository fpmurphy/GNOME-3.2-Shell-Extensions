//
//  Copyright (c) 2011.  Finnbarr P. Murphy.  All rights reserved.
//

const Lang = imports.lang;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const AppFavorites = imports.ui.appFavorites;

const Gettext = imports.gettext.domain('gnome-shell');
const _ = Gettext.gettext;

const ICON_SIZE = 20;


function PanelLauncher(app) {
    this._init(app);
}

PanelLauncher.prototype = {
    _init: function(app) {
        this.actor = new St.Button({ style_class: 'panel-launcher',
                                     reactive: true });

        this.actor.set_child(app.create_icon_texture(ICON_SIZE));
        // this.actor.set_tooltip_text(app.get_name());
        this.actor._delegate = this;
        this._app = app;

        this.actor.connect('clicked', Lang.bind(this, function() {
            this._app.open_new_window(-1);
        }));
    }
};


function PanelPopupMenuItem() {
   this._init.apply(this, arguments);
}


PanelPopupMenuItem.prototype = {
    __proto__: PopupMenu.PopupBaseMenuItem.prototype,

    _init: function(icon, text, menu_icon_first, params) {
        PopupMenu.PopupBaseMenuItem.prototype._init.call(this, params);

        this.label = new St.Label({ text: text });

        if (menu_icon_first) {
            this.box = new St.BoxLayout({ style_class: 'panel-launcher-box'});
            this.box.add(icon);
            this.box.add(this.label);
            this.addActor(this.box);
        } else {
            this.addActor(this.label);
            this.addActor(icon);
        }
    }

};


function Favorites() {
    this._init();
}

Favorites.prototype = {
    FAVORITE_APPS_KEY: 'favorite-apps',

    _init: function() {
        this._buttons = [];
        this._appSystem = Shell.AppSystem.get_default();

        this.actor = new St.BoxLayout({ style_class: 'panel-launcher-box'});

        this._display();

        this._appSystem.connect('installed-changed', Lang.bind(this, this._redisplay));
        AppFavorites.getAppFavorites().connect('changed', Lang.bind(this, this._redisplay));

    },

    _display: function() {
        let launchers = global.settings.get_strv(this.FAVORITE_APPS_KEY);
        let appSys = Shell.AppSystem.get_default();

        let j = 0;
        for ( let i = 0; i < launchers.length; ++i ) {
            if ((app = appSys.lookup_app(launchers[i]))) {
                this._buttons[j] = new PanelLauncher(app);
                this.actor.add(this._buttons[j].actor);
                ++j;
            }
        }
    },

    _redisplay: function() {
        for ( let i = 0; i < this._buttons.length; ++i ) {
            this._buttons[i].actor.destroy();
        }

        this._display();
    },

    enable: function() {
        Main.panel._leftBox.insert_actor(this.actor, 1);
    },

    disable: function() {
        Main.panel._leftBox.remove_actor(this.actor);
    }

};

function init(extensionMeta) {
    return new Favorites();
}

