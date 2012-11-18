//
//  Copyright 2011 (c) Finnbarr P. Murphy.  All rights reserved.
//

const Layout = imports.ui.layout;


function NoRippleExtension() {
    this._init()
}


NoRippleExtension.prototype = {
    _init: function() {
         this._ripple = null;
    },

    enable: function() {
        this._ripple = Layout.HotCorner.prototype.rippleAnimation;
        Layout.HotCorner.prototype.rippleAnimation = function() {};
    },

    disable: function() {
        if (this._ripple != null) {
             Layout.HotCorner.prototype.rippleAnimation = this._ripple;
        }
        this._ripple = null;
    }
};


function init() {
    return new NoRippleExtension(); 
}
