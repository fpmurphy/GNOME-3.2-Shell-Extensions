//
//  Copyright (c) 2011 Finnbarr P. Murphy. All rights reserved.   
//

const St = imports.gi.St;
const Shell = imports.gi.Shell;
const Main = imports.ui.main;


function ThemeActivitiesButton(meta) {
    this._init(meta)
}


ThemeActivitiesButton.prototype = {
    _init: function(meta) {
        this._defaultStylesheet = Main._defaultCssStylesheet;
        this._patchStylesheet = meta.path + '/activitiesbutton.css';
        this._themeContext = St.ThemeContext.get_for_stage(global.stage);
    },

    enable: function() {
        let theme = new St.Theme ({ application_stylesheet: this._patchStylesheet,
                                    theme_stylesheet: this._defaultStylesheet });
        try {
            this._themeContext.set_theme(theme);
        } catch (e) {
            global.logError('Stylesheet parse error: ' + e);
        }
    },

    disable: function() {
        let theme = new St.Theme ({ theme_stylesheet: this._defaultStylesheet });
        try {
            this._themeContext.set_theme(theme);
        } catch (e) {
            global.logError('Stylesheet parse error: ' + e);
        }
    }

};


function init(meta) {
    return new ThemeActivitiesButton(meta); 
}
