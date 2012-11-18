//
//  Copyright 2011 (c) Finnbarr P. Murphy.  All rights reserved.
//

const Main = imports.ui.main;

const START_OF_WEEK = 2;     // USA: Sunday = 1, Monday = 2, etc.  


function StartOfWeek() {
    this._init()
}

StartOfWeek.prototype = {
    _init: function() {
        this.original = Main.panel._dateMenu._calendar._weekStart;
    },

    enable: function() {
        let calendar = Main.panel._dateMenu._calendar;
   
        if ( START_OF_WEEK > 1 && START_OF_WEEK < 8 ) {
            calendar._weekStart = (START_OF_WEEK - 1);
            calendar._buildHeader();
        }   
    },

    disable: function() {
        let calendar = Main.panel._dateMenu._calendar;
        if (calendar._weekStart != this.original) {
            calendar._weekStart = this.original;
            calendar._buildHeader();
        }
    }
};


function init() {
    return new StartOfWeek()
}
