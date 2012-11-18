//
//  Copyright 2011 (c) Finnbarr P. Murphy.  All rights reserved.
//

const Gio = imports.gi.Gio;
const St = imports.gi.St;
const Main = imports.ui.main;
const Calendar = imports.ui.calendar;
const DateMenu = imports.ui.dateMenu;
const PanelMenu = imports.ui.panelMenu;
const Lang = imports.lang;
const Mainloop = imports.mainloop;

const Gettext = imports.gettext.domain('gnome-shell');
const _ = Gettext.gettext;

// in org.gnome.desktop.interface
const CLOCK_FORMAT_KEY        = 'clock-format';

// in org.gnome.shell.clock
const CLOCK_SHOW_DATE_KEY     = 'show-date';
const CLOCK_SHOW_SECONDS_KEY  = 'show-seconds';

// USA 1 = sunday, 2 = monday
const START_OF_WEEK = 1;      



function SimpleCalendar() {
    this._init(this);
}

SimpleCalendar.prototype = {
    __proto__: PanelMenu.Button.prototype,

    _init: function() {
        PanelMenu.Button.prototype._init.call(this, 0.5);

        this._clock = new St.Label();
        this.actor.add_actor(this._clock);

        let vbox = new St.BoxLayout({name: 'rhc-calendar-area', vertical: true});
        this.menu.addActor(vbox);

        // date
        this._date = new St.Label({ style_class: 'rhc-calendar-label'});
        vbox.add(this._date);

        // calendar
        this._eventSource = new Calendar.DBusEventSource();
        this._calendar = new Calendar.Calendar(this._eventSource);
        if ( START_OF_WEEK > 1 && START_OF_WEEK < 8 ) {
            this._calendar._weekStart = (START_OF_WEEK - 1);
            this._calendar._buildHeader();
        }

        vbox.add(this._calendar.actor);

        this.menu.connect('open-state-changed', Lang.bind(this, function(menu, isOpen) {
            if (isOpen) {
                let now = new Date();
                this._calendar.setDate(now, true);
            }
        }));

        this._desktopSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
        this._clockSettings = new Gio.Settings({ schema: 'org.gnome.shell.clock' });
        this._desktopSettings.connect('changed', Lang.bind(this, this._updateClockAndDate));
        this._clockSettings.connect('changed', Lang.bind(this, this._updateClockAndDate));

        // start the clock 
        this._updateClockAndDate();
    },

    _updateClockAndDate: function() {
        let format = this._desktopSettings.get_string(CLOCK_FORMAT_KEY);
        let showDate = this._clockSettings.get_boolean(CLOCK_SHOW_DATE_KEY);
        let showSeconds = this._clockSettings.get_boolean(CLOCK_SHOW_SECONDS_KEY);

        let clockFormat;
        let dateFormat;

        switch (format) {
            case '24h':
                if (showDate)
                    clockFormat = showSeconds ? _("%a %b %e, %R:%S")
                                              : _("%a %b %e, %R");
                else
                    clockFormat = showSeconds ? _("%a %R:%S")
                                              : _("%a %R");
                break;
            case '12h':
            default:
                if (showDate)
                    clockFormat = showSeconds ? _("%a %b %e, %l:%M:%S %p")
                                              : _("%a %b %e, %l:%M %p");
                else
                    clockFormat = showSeconds ? _("%a %l:%M:%S %p")
                                              : _("%a %l:%M %p");
                break;
        }

        let displayDate = new Date();

        this._clock.set_text(displayDate.toLocaleFormat(clockFormat));

        dateFormat = _("%A %B %e, %Y");
        this._date.set_text(displayDate.toLocaleFormat(dateFormat));

        Mainloop.timeout_add_seconds(1, Lang.bind(this, this._updateClockAndDate));
        return false;
    }
};


function ChangeDateMenu() {
    this._init()
}

ChangeDateMenu.prototype = {
    _init: function() {
        this.dateMenu = new SimpleCalendar();
        this.orgDateMenu = Main.panel._dateMenu;
    },

    enable: function() {
        let ordinal = this.removemenu(DateMenu.DateMenuButton);
        this.addmenu(this.dateMenu, ordinal);
    },

    disable: function() {
        let ordinal = this.removemenu(SimpleCalendar);
        this.addmenu(this.orgDateMenu, ordinal);
    },

    removemenu: function(instancetype) {
        let children = Main.panel._centerBox.get_children();
        let i = 0;
        for (; i < children.length; i++) {
            let item = children[i];
            if (item._delegate instanceof instancetype) {
                Main.panel._menus.removeMenu(Main.panel._dateMenu.menu);
                Main.panel._centerBox.remove_actor(Main.panel._dateMenu.actor);
                break;
            }
        }
        return i;
    },

    addmenu: function(menuitem, ordinal) {
        Main.panel._dateMenu = menuitem;
        Main.panel._centerBox.insert_actor(menuitem.actor, ordinal, { y_fill: true });
        Main.panel._menus.addMenu(menuitem.menu);
    }
};

function init() {
    return new ChangeDateMenu();
}
