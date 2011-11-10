//
//  Copyright 2011 (c) Finnbarr P. Murphy.  All rights reserved.
//

const Main = imports.ui.main;

function NoA11y() {
    this._init()
}

NoA11y.prototype = {
    _init: function() {
        this._removed = null;
    },

    enable: function() {
        if (this._removed == true) return;

        let _a11y = Main.panel._statusArea['a11y'];

        let children = Main.panel._rightBox.get_children();
        for (let i = 0; i < children.length; i++) {
            if (children[i]._delegate == _a11y) {
                children[i].destroy();
                this._removed = true;
                Main.panel._statusArea['a11y'] = null;
                break;
            }
        }
    },


    disable: function() {
          if (this._removed == false) return;
          
          let _index = 0;
          let _volume = Main.panel._statusArea['volume'];

          let children = Main.panel._rightBox.get_children();
          for (let i = 0; i < children.length; i++) {
              if (children[i]._delegate == _volume) { 
                  _index = i;
                  break;
              }
          }
          if (_index > 0) _index--;

          let indicator = new Main.panel._status_area_shell_implementation['a11y'];
          Main.panel.addToStatusArea('a11y', indicator, _index);
          this._removed = false;
    }

};


function init() {
    return new NoA11y(); 
}
