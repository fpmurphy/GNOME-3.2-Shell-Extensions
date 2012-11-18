//
//  Copyright 2011 (c) Finnbarr P. Murphy.  All rights reserved.
//

const Main = imports.ui.main;
const Lang = imports.lang;
const St = imports.gi.St;

const TEXTURE_CACHE_POLICY = 1;


function OpenSearchProviderIcon() {
    this._init()
}

OpenSearchProviderIcon.prototype = {
    _init: function() {
        this.ptr = Main.overview._viewSelector._searchTab;

        this.oldGetProviders = this.ptr._openSearchSystem.getProviders;
        this.oldCreateOpenSearchProviderButton = this.ptr._searchResults._createOpenSearchProviderButton;

    },
 
    enable: function() {
        this.ptr._openSearchSystem.getProviders = this.getProviders;
        this.ptr._searchResults._createOpenSearchProviderButton = this._createOpenSearchProviderButton;
        this.ptr._openSearchSystem._refresh();
        this.ptr._searchResults._updateOpenSearchProviderButtons;
    },

    disable: function() {
        this.ptr._openSearchSystem.getProviders = this.oldGetProviders;
        this.ptr._searchResults._createOpenSearchProviderButton = this.oldCreateOpenSearchProviderButton;
        this.ptr._openSearchSystem._refresh();
        this.ptr._searchResults._updateOpenSearchProviderButtons;
    },

    getProviders: function() {
        let res = [];
        for (let i = 0; i < this._providers.length; i++) {
             res.push({ id: i, 
                      name: this._providers[i].name, 
                      icon_uri: this._providers[i].icon_uri });
        }
        return res;
    },

    _createOpenSearchProviderButton: function(provider) {

        let button = new St.Button({ style_class: 'dash-search-button',
                                     reactive: true,
                                     x_fill: true,
                                     y_align: St.Align.MIDDLE });

        button.connect('clicked', Lang.bind(this, function() {
            this._openSearchSystem.activateResult(provider.id);
        }));

        let title = new St.Label({ text: provider.name,
                                   style_class: 'dash-search-button-label' });

        let textureCache = St.TextureCache.get_default();
        let searchIcon = textureCache.load_uri_sync(TEXTURE_CACHE_POLICY,
                                                    provider.icon_uri, -1, -1);
 
        let iconBin = new St.Bin({ style_class: 'dash-search-button-icon',
                                   child: searchIcon });
 
        let box = new St.BoxLayout();
        box.add(iconBin, {expand: true, x_fill: false, x_align: St.Align.END });
        box.add(title, {expand: true, x_fill: false, x_align: St.Align.START });
 
        button.set_child(box);
        provider.actor = button;
        this._searchProvidersBox.add(button);
    }

};

function init() {
    return new OpenSearchProviderIcon(); 
}
