//
//  Copyright (c) 2011 Finnbarr P. Murphy.  All rights reserved.
//
//

const Lang = imports.lang;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

// change these to suit your own tastes and your system
const PANEL_HEIGHT = 25;
const AUTOHIDE_ANIMATION_TIME = 0.4;
const TIME_DELTA = 1500;


function AutoHide() {
    this._init()
}
 
AutoHide.prototype = {
    _init: function() {
        this._buttonEvent = 0;
        this._leaveEvent = 0;
        this._enterEvent = 0;

        this._hidden = false;
        this._hidetime = 0;
        this._hideable = true;
    },

    _hidePanel: function() {
        if (Main.overview.visible || this._hideable == false) return;

        Tweener.addTween(Main.panel.actor,
                     { height: 1,
                       time: AUTOHIDE_ANIMATION_TIME,
                       transition: 'easeOutQuad'
                     });

        let params = { y: 0,
                       time: AUTOHIDE_ANIMATION_TIME,
                       transition: 'easeOutQuad'
                     };

        Tweener.addTween(Main.panel._leftCorner.actor, params);
        Tweener.addTween(Main.panel._rightCorner.actor, params);

        params = { opacity: 0,
                   time: AUTOHIDE_ANIMATION_TIME - 0.1,
                   transition: 'easeOutQuad'
                 };

        Tweener.addTween(Main.panel._leftBox, params);
        Tweener.addTween(Main.panel._centerBox, params);
        Tweener.addTween(Main.panel._rightBox, params);

        this._hidden = true;
    },

    _showPanel: function() {
        if (this._hidden == false) return;

        let params = { y: PANEL_HEIGHT - 1,
                       time: AUTOHIDE_ANIMATION_TIME + 0.1,
                       transition: 'easeOutQuad'
                     };
 
        Tweener.addTween(Main.panel._leftCorner.actor, params);
        Tweener.addTween(Main.panel._rightCorner.actor, params);

        Tweener.addTween(Main.panel.actor,
                     { height: PANEL_HEIGHT,
                       time: AUTOHIDE_ANIMATION_TIME,
                       transition: 'easeOutQuad'
                     });

        params = { opacity: 255,
                   time: AUTOHIDE_ANIMATION_TIME+0.2,
                   transition: 'easeOutQuad'
                 };

        Tweener.addTween(Main.panel._leftBox, params);
        Tweener.addTween(Main.panel._centerBox, params);
        Tweener.addTween(Main.panel._rightBox, params);

        this._hidden = false;
    },

    _toggleChrome: function(bool) {
        let mlm = Main.layoutManager;
        mlm.removeChrome(mlm.panelBox);
        mlm.addChrome(mlm.panelBox, { affectsStruts: bool });
    },

    _toggleHideable: function(actor, event) {
        let ticks = event.get_time();
 
        if (this._hidetime == 0) {
            this._hidetime = ticks;
            return;
        }

        if ((ticks - this._hidetime) > TIME_DELTA) {
            this._hidetime = 0;
            return;
        }

        if (this._hideable == true) {
            this._hideable = false;
            this._toggleChrome(true);
        } else {
            this._hideable = true;
            this._toggleChrome(false);
        }

        this._hidetime = 0;
    },
 
    enable: function() {
        this._leaveEvent = Main.panel.actor.connect('leave-event', 
                                Lang.bind(Main.panel, this._hidePanel));
        this._enterEvent = Main.panel.actor.connect('enter-event', 
                                Lang.bind(Main.panel, this._showPanel));
        this._buttonEvent = Main.panel.actor.connect('button-release-event', 
                                Lang.bind(Main.panel, this._toggleHideable));

        this._toggleChrome(false);
        this._hideable = true;
        this._hidePanel();
    },
 
    disable: function() {
        if (this._buttonEvent) {
            Main.panel.actor.disconnect(this._buttonEvent);
            this._buttonEvent = 0;
        }
        if (this._leaveEvent) {
            Main.panel.actor.disconnect(this._leaveEvent);
            this._leaveEvent = 0;
        }
        if (this._enterEvent) {
            Main.panel.actor.disconnect(this._enterEvent);
            this._enterEvent = 0;
        }

        this._toggleChrome(true);
        this._hideable = true;
        this._showPanel();
    }

};
 
function init() {
    return new AutoHide();
}
