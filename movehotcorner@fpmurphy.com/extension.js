//
//  Copyright 2011 (c) Finnbarr P. Murphy.  All rights reserved.
//

const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Main = imports.ui.main;
const Panel = imports.ui.panel;
const Tweener = imports.ui.tweener;
const Gettext = imports.gettext.domain('gnome-shell');
const _ = Gettext.gettext;

const HOT_CORNER_ACTIVATION_TIMEOUT = 0.5;
const SHOW_RIPPLE  = true;               // change to false if you do not want the ripple
const SHOW_LABEL   = false;              // change to true if you want Activities label
const SHOW_ICON    = true;               // change to false if you want icon  
const ICON_NAME    = 'fedora-logo-icon'  // 24x24 icon PNG under /usr/share/icons/... 
const HOTSPOT_SIZE = 1;                  // change if you need/want a bigger hotspot


function RightHotCorner() {
    this._init(this, arguments);
}

RightHotCorner.prototype = {
    _init : function() {
        this._entered = false;
        this._activationTime = 0;
        this._show_ripple = SHOW_RIPPLE;

        let box   = new St.BoxLayout({ style_class: 'activities_box'});
        let label = new St.Label({ text: _("Activities") });
        let icon  = new St.Icon({ icon_type: St.IconType.FULLCOLOR, 
                                  icon_size: 24, 
                                  icon_name: ICON_NAME });

        this._button = new St.Button({ name: 'panelActivities',
                                       style_class: 'panel-button',
                                       reactive: true,
                                       can_focus: true });

        if (SHOW_LABEL) {
            box.add_actor(label);
        }
        if (SHOW_ICON) {
            box.add_actor(icon);
        }
        this._button.set_child(box);
        this._button._delegate = this._button;

        this._button._xdndTimeOut = 0;
        this._button.handleDragOver = Lang.bind(this,
            function(source, actor, x, y, time) {
                 if (source == Main.xdndHandler) {
                     if (!Main.overview.visible && !Main.overview.animationInProgress) {
                         this._rippleAnimation();
                         Main.overview.showTemporarily();
                         Main.overview.beginItemDrag(actor);
                     }
                 }
            });

        this._button.connect('clicked', Lang.bind(this, function(b) {
            if (this.shouldToggleOverviewOnClick())
                Main.overview.toggle();
            return true;
        }));

        let primaryMonitor = global.screen.get_primary_monitor();
        let monitor =  global.screen.get_monitor_geometry(primaryMonitor)
        let cornerX = monitor.x + monitor.width;
        let cornerY = monitor.y;

        this.actor = new Clutter.Group({ name: 'right-hot-corner-environs',
                                         width: HOTSPOT_SIZE + 2,
                                         height: HOTSPOT_SIZE + 2,
                                         reactive: true });

        this._corner = new Clutter.Rectangle({ name: 'right-hot-corner',
                                               width: HOTSPOT_SIZE + 2,
                                               height: HOTSPOT_SIZE + 2,
                                               opacity: 0,
                                               reactive: true });
        this._corner._delegate = this;
        this.actor.add_actor(this._corner);
        this._corner.set_position(this.actor.width - this._corner.width, 0);
        this.actor.set_anchor_point_from_gravity(Clutter.Gravity.NORTH_EAST);
        this.actor.set_position(cornerX, cornerY);

        this.actor.connect('leave-event',
                           Lang.bind(this, this._onEnvironsRight));
        this.actor.connect('button-release-event',
                           Lang.bind(this, this._onCornerClicked));

        this._corner.connect('enter-event',
                             Lang.bind(this, this._onCornerEntered));
        this._corner.connect('button-release-event',
                             Lang.bind(this, this._onCornerClicked));
        this._corner.connect('leave-event',
                             Lang.bind(this, this._onCornerRight));

        this._rhripple1 = new St.BoxLayout({ style_class: 'rhc-ripple-box', opacity: 0 });
        this._rhripple2 = new St.BoxLayout({ style_class: 'rhc-ripple-box', opacity: 0 });
        this._rhripple3 = new St.BoxLayout({ style_class: 'rhc-ripple-box', opacity: 0 });
       
        Main.uiGroup.add_actor(this._rhripple1);
        Main.uiGroup.add_actor(this._rhripple2);
        Main.uiGroup.add_actor(this._rhripple3);

        Main.layoutManager._chrome.addActor(this.actor);
    },

    destroy: function() {
        this.actor.destroy();
    },


    _animateRipple : function(ripple, delay, time, startScale, startOpacity, finalScale ) {
        ripple._opacity =  startOpacity;
        ripple.set_anchor_point_from_gravity(Clutter.Gravity.NORTH_EAST);

        ripple.visible = true;
        ripple.opacity = 255 * Math.sqrt(startOpacity);
        ripple.scale_x = ripple.scale_y = startScale;

        let [x, y] = this._corner.get_transformed_position();
        ripple.x = x + HOTSPOT_SIZE;
        ripple.y = y;

        Tweener.addTween(ripple, { _opacity: 0,
                                   scale_x: finalScale,
                                   scale_y: finalScale,
                                   delay: delay,
                                   time: time,
                                   transition: 'linear',
                                   onUpdate: function() { ripple.opacity = 255 * Math.sqrt(ripple._opacity); },
                                   onComplete: function() { ripple.visible = false; } });

    },

    _rippleAnimation: function() {
        if (this._show_ripple) {
            this._animateRipple(this._rhripple1, 0.0,   0.83,  0.25,  1.0,     1.5);
            this._animateRipple(this._rhripple2, 0.05,  1.0,   0.0,   0.7,     1.25);
            this._animateRipple(this._rhripple3, 0.35,  1.0,   0.0,   0.3,     1);
        }
    },

    _onCornerEntered : function() {
        if (!this._entered) {
            this._entered = true;
            if (!Main.overview.animationInProgress) {
                this._activationTime = Date.now() / 1000;
                this._rippleAnimation();
                Main.overview.toggle();
            }
        }
        return false;
    },

    _onCornerClicked : function() {
        if (this.shouldToggleOverviewOnClick())
             Main.overview.toggle();
        return true;
    },

    _onCornerRight : function(actor, event) {
        if (event.get_related() != this.actor)
            this._entered = false;
        return true;
    },

    _onEnvironsRight : function(actor, event) {
        if (event.get_related() != this._corner)
            this._entered = false;
        return false;
    },

    shouldToggleOverviewOnClick: function() {
        if (Main.overview.animationInProgress)
            return false;
        if (this._activationTime == 0 || 
            Date.now() / 1000 - this._activationTime > HOT_CORNER_ACTIVATION_TIMEOUT)
            return true;
        return false;
    },

    disable: function() {
        Main.panel._rightBox.remove_actor(this._button);
        Main.panel._leftBox.insert_actor(Main.panel._activities, 0);
    },

    enable: function() {
       let children = Main.panel._leftBox.get_children();
       Main.panel._leftBox.remove_actor(Main.panel._activities);
       Main.panel._rightBox.add_actor(this._button);
    },

};

function init() {
    return new RightHotCorner();
}

