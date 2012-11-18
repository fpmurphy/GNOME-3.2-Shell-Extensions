//
// Copyright (c) 2011 Finnbarr P. Murphy.  All rights reserved.
//

const Panel = imports.ui.main.panel;

function init() {}

function enable() {
    Panel._dateMenu.actor.hide();
}

function disable() {
    Panel._dateMenu.actor.show();
}
