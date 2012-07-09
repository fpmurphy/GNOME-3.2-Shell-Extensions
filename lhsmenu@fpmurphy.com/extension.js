//
//     Finnbarr P. Murphy  October 2011 
//
//     Most of this code came from Linux Mint MGSE repository.
//     I just made it more object orientated.
//

const Mainloop = imports.mainloop;
const GMenu = imports.gi.GMenu;
const Lang = imports.lang;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const AppFavorites = imports.ui.appFavorites;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;

const ICON_SIZE = 16;
const FAV_ICON_SIZE = 30;
const CATEGORY_ICON_SIZE = 20;
const APPLICATION_ICON_SIZE = 20;


function AppMenuItem() {
    this._init.apply(this, arguments);
}

AppMenuItem.prototype = {
    __proto__: PopupMenu.PopupBaseMenuItem.prototype,

    _init: function (app, params) {
        PopupMenu.PopupBaseMenuItem.prototype._init.call(this, params);

        this._app = app;
        this.label = new St.Label({ text: app.get_name() });
        this.addActor(this.label);
        this._icon = app.create_icon_texture(ICON_SIZE);
        this.addActor(this._icon, { expand: false });
    },

    activate: function (event) {
        this._app.activate_full(-1, event.get_time());
        PopupMenu.PopupBaseMenuItem.prototype.activate.call(this, event);
    }

};


function ApplicationButton(app, apps_button) {
    this._init(app, apps_button);
}

ApplicationButton.prototype = {
    _init: function(app, apps_button) {
    this.app = app;                    
        this.actor = new St.Button({ reactive: true, 
                                     label: this.app.get_name(), 
                                     style_class: 'application-button', 
                                     x_align: St.Align.START });        
        this.buttonbox = new St.BoxLayout();
        this.label = new St.Label({ text: this.app.get_name(), 
                                    style_class: 'application-button-label' });        
        this.icon = this.app.create_icon_texture(APPLICATION_ICON_SIZE); 
        this.buttonbox.add_actor(this.icon);
        this.buttonbox.add_actor(this.label);
        this.actor.set_child(this.buttonbox);

        this.actor.connect('clicked', Lang.bind(this, function() {      
            this.app.open_new_window(-1);
            apps_button.close();
        }));
    }
};


function PlaceButton(place, button_name, apps_button) {
    this._init(place, button_name, apps_button);
}

PlaceButton.prototype = {
    _init: function(place, button_name, apps_button) {
        this.place = place;            
        this.button_name = button_name;        
        this.actor = new St.Button({ reactive: true, label: this.button_name, 
                                     style_class: 'application-button', 
                                     x_align: St.Align.START });        
        this.buttonbox = new St.BoxLayout();
        this.label = new St.Label({ text: this.button_name, 
                                    style_class: 'application-button-label' });        
        this.icon = place.iconFactory(APPLICATION_ICON_SIZE); 
        this.buttonbox.add_actor(this.icon);
        this.buttonbox.add_actor(this.label);
        this.actor.set_child(this.buttonbox);        
        this.actor.connect('clicked', Lang.bind(this, function() {      
            this.place.launch();
            apps_button.close();
        }));
    }
};


function CategoryButton(app) {
    this._init(app);
}

CategoryButton.prototype = {
    _init: function(category) {    
        this.icon_name = category.get_icon().get_names().toString();
        this.actor = new St.Button({ reactive: true, 
                                     label: category.get_name(), 
                                     style_class: 'category-button', 
                                     x_align: St.Align.START  });        
        this.buttonbox = new St.BoxLayout();
        this.label = new St.Label({ text: category.get_name(), 
                                    style_class: 'category-button-label' }); 
        this.icon = new St.Icon({icon_name: this.icon_name, 
                                 icon_size: CATEGORY_ICON_SIZE, 
                                 icon_type: St.IconType.FULLCOLOR});             
        this.buttonbox.add_actor(this.icon);
        this.buttonbox.add_actor(this.label);
        this.actor.set_child(this.buttonbox);
    }
};


function PlaceCategoryButton(app) {
    this._init(app);
}

PlaceCategoryButton.prototype = {
    _init: function(category) {    
        this.actor = new St.Button({ reactive: true, 
                                     label: _("Places"), 
                                     style_class: 'category-button', 
                                     x_align: St.Align.START });        
        this.buttonbox = new St.BoxLayout();
        this.label = new St.Label({ text: _("Places"), 
                                    style_class: 'category-button-label' }); 
        this.icon = new St.Icon({ icon_name: "folder", 
                                  icon_size: CATEGORY_ICON_SIZE, 
                                  icon_type: St.IconType.FULLCOLOR});             

        this.buttonbox.add_actor(this.icon);
        this.buttonbox.add_actor(this.label);
        this.actor.set_child(this.buttonbox);        
    }
};


function FavoritesButton(app, apps_button) {
    this._init(app);
}

FavoritesButton.prototype = {
    _init: function(app, apps_button) {
        this.actor = new St.Button({ reactive: true, 
                                     style_class: 'favorites-button' });
        this.actor.set_child(app.create_icon_texture(FAV_ICON_SIZE));
        this._app = app;

        this.actor.connect('clicked', Lang.bind(this, function() {        
            this._app.open_new_window(-1);
            apps_button.close();
        }));
    }
};


function MintButton(menuAlignment, menuOrientation) {
    this._init(menuAlignment);
}

MintButton.prototype = {
    __proto__: PanelMenu.ButtonBox.prototype,

    _init: function(menuAlignment, menuOrientation) {
        PanelMenu.ButtonBox.prototype._init.call(this, { reactive: true,
                                                         can_focus: true,
                                                         track_hover: true });

        this.actor.connect('button-press-event', Lang.bind(this, this._onButtonPress));
        this.actor.connect('key-press-event', Lang.bind(this, this._onSourceKeyPress));

        this.menu = new PopupMenu.PopupMenu(this.actor, menuAlignment, menuOrientation);
        this.menu.actor.add_style_class_name('panel-menu');
        this.menu.connect('open-state-changed', Lang.bind(this, this._onOpenStateChanged));
        this.menu.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));

        Main.uiGroup.add_actor(this.menu.actor);
        this.menu.actor.hide();
    },

    _onButtonPress: function(actor, event) {
        if (!this.menu.isOpen) {
            // Setting the max-height won't do any good if the minimum height of the
            // menu is higher then the screen; it's useful if part of the menu is
            // scrollable so the minimum height is smaller than the natural height
            let monitor = Main.layoutManager.primaryMonitor;
            this.menu.actor.style = ('max-height: ' +
                                     Math.round(monitor.height - Main.panel.actor.height) +
                                     'px;');
        }
        this.menu.toggle();
    },

    _onSourceKeyPress: function(actor, event) {
        let symbol = event.get_key_symbol();
        if (symbol == Clutter.KEY_space || symbol == Clutter.KEY_Return) {
            this.menu.toggle();
            return true;
        } else if (symbol == Clutter.KEY_Escape && this.menu.isOpen) {
            this.menu.close();
            return true;
        } else if (symbol == Clutter.KEY_Down) {
            if (!this.menu.isOpen)
                this.menu.toggle();
            this.menu.actor.navigate_focus(this.actor, Gtk.DirectionType.DOWN, false);
            return true;
        } else
            return false;
    },

    _onMenuKeyPress: function(actor, event) {
        let symbol = event.get_key_symbol();
        if (symbol == Clutter.KEY_Left || symbol == Clutter.KEY_Right) {
            let focusManager = St.FocusManager.get_for_stage(global.stage);
            let group = focusManager.get_group(this.actor);
            if (group) {
                let direction = (symbol == Clutter.KEY_Left) ? Gtk.DirectionType.LEFT : Gtk.DirectionType.RIGHT;
                group.navigate_focus(this.actor, direction, false);
                return true;
            }
        }
        return false;
    },

    _onOpenStateChanged: function(menu, open) {
        if (open)
            this.actor.add_style_pseudo_class('active');
        else
            this.actor.remove_style_pseudo_class('active');
    },

    destroy: function() {
        this.actor._delegate = null;
        this.menu.destroy();
        this.actor.destroy();
        this.emit('destroy');
    }
};


function ApplicationsButton(icon_path, menu_orientation) {
    this._init(icon_path, menu_orientation);
}

ApplicationsButton.prototype = {
    __proto__: MintButton.prototype,

    _init: function(icon_path, menu_orientation) {
        MintButton.prototype._init.call(this, 1, menu_orientation);

        let box = new St.BoxLayout({ name: 'mintMenu' });
        this.actor.add_actor(box);
        this._iconBox = new St.Bin();
        box.add(this._iconBox, { y_align: St.Align.MIDDLE, y_fill: false });        
        
        // UNCOMMENT THE FOLLOWING LINES OF CODE IF YOU WANT A CUSTOM ICON 
        // let icon_file = icon_path + "menu.png";
        // let file = Gio.file_new_for_path(icon_file);
        // let icon_uri = file.get_uri(); 
        // this._icon = St.TextureCache.get_default().load_uri_sync(1, icon_uri, 22, 22);        

        this._icon = new St.Icon({ icon_name: 'start-here', style_class: 'popup-menu-icon' });
        this._iconBox.child = this._icon;                         

        // UNCOMMENT THE FOLLOWING LINES OF CODE IF YOU WANT A TEXT LABEL
        // this._label = new St.Label();
        // box.add(this._label, { y_align: St.Align.MIDDLE, y_fill: false });
        // this._label.set_text(_(" Menu"));        
        
        this._searchInactiveIcon = new St.Icon({ style_class: 'search-entry-icon',
                                                 icon_name: 'edit-find',
                                                 icon_type: St.IconType.SYMBOLIC });

        this._searchActiveIcon = new St.Icon({ style_class: 'search-entry-icon',
                                               icon_name: 'edit-clear',
                                               icon_type: St.IconType.SYMBOLIC });
        this._searchTimeoutId = 0;
        this._searchIconClickedId = 0;
        
        this._display();
        Shell.AppSystem.get_default().connect('installed-changed', Lang.bind(this, this.reDisplay));
        AppFavorites.getAppFavorites().connect('changed', Lang.bind(this, this.reDisplay));
        
        this.menu.connect('open-state-changed', Lang.bind(this, this._onOpenStateToggled));
    },
    
    _onOpenStateToggled: function(menu, open) {
       if (open) global.stage.set_key_focus(this.searchEntry);
       else this.resetSearch();
    },

    reDisplay : function() {
        this._clearAll();
        this._display();
    },

    _clearAll : function() {
        this.menu.removeAll();
    },
   
    _loadCategory: function(dir) {
        var iter = dir.iter();
        var nextType;
        while ((nextType = iter.next()) != GMenu.TreeItemType.INVALID) {
            if (nextType == GMenu.TreeItemType.ENTRY) {
                var entry = iter.get_entry();
                if (!entry.get_app_info().get_nodisplay()) {
                    var app = Shell.AppSystem.get_default().lookup_app_by_tree_entry(entry);        
                    if (!this.applicationsByCategory[dir.get_menu_id()]) 
                        this.applicationsByCategory[dir.get_menu_id()] = new Array();            
                    this.applicationsByCategory[dir.get_menu_id()].push(app);                    
                }
            } else if (nextType == GMenu.TreeItemType.DIRECTORY) {
                this._loadCategory(iter.get_directory());
            }
        }
    },    
               
    _display : function() {
        let section = new PopupMenu.PopupMenuSection();        
        this.menu.addMenuItem(section);            
        let favoritesTitle = new St.Label({ track_hover: true, 
                                            style_class: 'favorites-title', 
                                            text: "Favorites" });
        this.favoritesBox = new St.BoxLayout({ style_class: 'favorites-box', 
                                               vertical: true });         
        
        let rightPane = new St.BoxLayout({ vertical: true });
        
        this.searchBox = new St.BoxLayout({ style_class: 'search_box' });
        rightPane.add_actor(this.searchBox);
        this.searchEntry = new St.Entry({ name: 'searchEntry',
                                          hint_text: _("Type to search..."),
                                          track_hover: true,
                                          can_focus: true });
        this.searchEntry.set_secondary_icon(this._searchInactiveIcon);
        this.searchBox.add_actor(this.searchEntry);
        this.searchActive = false;
        this.searchEntryText = this.searchEntry.clutter_text;
        this.searchEntryText.connect('text-changed', Lang.bind(this, this._onSearchTextChanged));
        
        this.categoriesApplicationsBox = new St.BoxLayout();
        rightPane.add_actor(this.categoriesApplicationsBox);
        this.categoriesBox = new St.BoxLayout({ style_class: 'categories-box', 
                                                vertical: true }); 
        this.applicationsScrollBox = new St.ScrollView({ x_fill: true, 
                                                         y_fill: false, 
                                                         y_align: St.Align.START, 
                                                         style_class: 'vfade applications-scrollbox' });
        this.applicationsBox = new St.BoxLayout({ style_class: 'applications-box', vertical:true });
        this.applicationsScrollBox.add_actor(this.applicationsBox)
        this.applicationsScrollBox.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
        this.categoriesApplicationsBox.add_actor(this.categoriesBox);
        this.categoriesApplicationsBox.add_actor(this.applicationsScrollBox);
                     
        //Load favorites                 
        let launchers = global.settings.get_strv('favorite-apps');
        let appSys = Shell.AppSystem.get_default();
        let j = 0;
        for ( let i = 0; i < launchers.length; ++i ) {
            let app = appSys.lookup_app(launchers[i]);
            if (app) {        
                let button = new FavoritesButton(app, this.menu);                
                this.favoritesBox.add_actor(button.actor);
                button.actor.connect('enter-event', Lang.bind(this, function() {
                   this.selectedAppTitle.set_text(button._app.get_name());
                   if (button._app.get_description()) this.selectedAppDescription.set_text(button._app.get_description());
                   else this.selectedAppDescription.set_text("");
                }));
                button.actor.connect('leave-event', Lang.bind(this, function() {
                   this.selectedAppTitle.set_text("");
                   this.selectedAppDescription.set_text("");
                }));
                ++j;
            }
        }
                                              
        let applicationsTitle = new St.Label({ style_class: 'applications-title', text: "Applications" });
 
        this.mainBox = new St.BoxLayout({ style_class: 'applications-box', vertical:false });
        
        this.mainBox.add_actor(this.favoritesBox, { span: 1 });
        this.mainBox.add_actor(rightPane, { span: 1 });
        
        section.actor.add_actor(this.mainBox);
        
        this.applicationsByCategory = {};
        let tree = Shell.AppSystem.get_default().get_tree();
        let root = tree.get_root_directory();

        let iter = root.iter();
        let nextType;

        while ((nextType = iter.next()) != GMenu.TreeItemType.INVALID) {
            if (nextType == GMenu.TreeItemType.DIRECTORY) {
                let dir = iter.get_directory();                            
                this.applicationsByCategory[dir.get_menu_id()] = new Array();
                this._loadCategory(dir);                
                let categoryButton = new CategoryButton(dir);
                categoryButton.actor.connect('clicked', Lang.bind(this, function() {
                    this._select_category(dir, categoryButton);
                }));
                categoryButton.actor.connect('enter-event', Lang.bind(this, function() {
                    if (!this.searchActive) this._select_category(dir, categoryButton);
                }));
                this.categoriesBox.add_actor(categoryButton.actor);
            }
        }
        
        this.placesButton = new PlaceCategoryButton();
        this.placesButton.actor.connect('clicked', Lang.bind(this, function() {
            this._select_places(this.placesButton);
        }));
        this.placesButton.actor.connect('enter-event', Lang.bind(this, function() {
            if (!this.searchActive) this._select_places(this.placesButton);
        }));
        this.categoriesBox.add_actor(this.placesButton.actor);
        
        this.selectedAppBox = new St.BoxLayout({ style_class: 'selected-app-box', vertical: true }); 
        this.selectedAppTitle = new St.Label({ style_class: 'selected-app-title', text: "" });
        this.selectedAppBox.add_actor(this.selectedAppTitle);
        this.selectedAppDescription = new St.Label({ style_class: 'selected-app-description', text: "" });
        this.selectedAppBox.add_actor(this.selectedAppDescription);
        section.actor.add_actor(this.selectedAppBox);
    },
    
    _clearApplicationsBox: function(selectedActor){
       let actors = this.applicationsBox.get_children();
         for (var i=0; i<actors.length; i++) {
            let actor = actors[i];            
            this.applicationsBox.remove_actor(actor);    
         }
       
       let actors = this.categoriesBox.get_children();

         for (var i=0; i<actors.length; i++){
             let actor = actors[i];      
             if (actor==selectedActor) actor.style_class = "category-button-selected";
             else actor.style_class = "category-button";
         }
    },
    
    _select_category : function(dir, categoryButton) {    
        this.resetSearch();
        this._clearApplicationsBox(categoryButton.actor);
        this._displayButtons(this._listApplications(dir.get_menu_id()));
    },
    
    _displayButtons: function(apps, places) {
         if (apps) {
            for (var i=0; i<apps.length; i++) {
               let app = apps[i];            
               let applicationButton = new ApplicationButton(app, this.menu);    /*FPM*/            
               this.applicationsBox.add_actor(applicationButton.actor);        
               applicationButton.actor.connect('enter-event', Lang.bind(this, function() {
                  this.selectedAppTitle.set_text(applicationButton.app.get_name());
                  if (applicationButton.app.get_description()) 
                      this.selectedAppDescription.set_text(applicationButton.app.get_description());
                  else 
                      this.selectedAppDescription.set_text("");
               }));
               applicationButton.actor.connect('leave-event', Lang.bind(this, function() {
                  this.selectedAppTitle.set_text("");
                  this.selectedAppDescription.set_text("");
               }));
            }
         }

         if (places) {
            for (var i=0; i<places.length; i++) {
               let place = places[i];            
               let button = new PlaceButton(place, place.name, this.menu);  /*FPM*/                
               this.applicationsBox.add_actor(button.actor);
            }
         }
     },
     
     _select_places : function(button) {             
         this.resetSearch();
         this._clearApplicationsBox(button.actor);
         
         let bookmarks = this._listBookmarks();  
         let devices = this._listDevices();  
         this._displayButtons(null, bookmarks.concat(devices));
     },
     
     setBottomPosition: function(value){
         // Need to find a way to do this
         if (value){
             //this.menu._arrowSide = St.Side.BOTTOM;
             //mintMenuOrientation = St.Side.BOTTOM;
             //this.disable();
             //this.enable();
         }else{
             //this.menu._arrowSide = St.Side.TOP;
             //mintMenuOrientation = St.Side.TOP;
             //this.disable();
             //this.enable();
         }
     },
     
     resetSearch: function(){
        this.searchEntry.set_text("");
        this.searchActive = false;
        global.stage.set_key_focus(this.searchEntry);
     },
     
     _onSearchTextChanged: function (se, prop) {
        this.searchActive = this.searchEntry.get_text() != '';
        if (this.searchActive) {
            this.searchEntry.set_secondary_icon(this._searchActiveIcon);

            if (this._searchIconClickedId == 0) {
                this._searchIconClickedId = this.searchEntry.connect('secondary-icon-clicked',
                    Lang.bind(this, function() {
                        this.resetSearch();
                    }));
            }
        } else {
            if (this._searchIconClickedId > 0)
                this.searchEntry.disconnect(this._searchIconClickedId);
            this._searchIconClickedId = 0;

            this.searchEntry.set_secondary_icon(this._searchInactiveIcon);
        }
        if (!this.searchActive) {
            if (this._searchTimeoutId > 0) {
                Mainloop.source_remove(this._searchTimeoutId);
                this._searchTimeoutId = 0;
            }
            return;
        }
        if (this._searchTimeoutId > 0)
            return;
        this._searchTimeoutId = Mainloop.timeout_add(150, Lang.bind(this, this._doSearch));
    },
    
    _listBookmarks: function(pattern) {
        let bookmarks = Main.placesManager.getBookmarks();
        var res = new Array();
        for (let id = 0; id < bookmarks.length; id++) {
            if (!pattern || bookmarks[id].name.toLowerCase().indexOf(pattern)!=-1) res.push(bookmarks[id]);
        }
        return res;
    },
    
    _listDevices: function(pattern) {
        let devices = Main.placesManager.getMounts();
        var res = new Array();
        for (let id = 0; id < devices.length; id++) {
           if (!pattern || devices[id].name.toLowerCase().indexOf(pattern)!=-1) res.push(devices[id]);
        }
        return res;
    },
    
    _listApplications: function(category_menu_id, pattern){
       var applist;
       if (category_menu_id) 
           applist = this.applicationsByCategory[category_menu_id];
       else{
          applist = new Array();
          for (directory in this.applicationsByCategory) 
              applist = applist.concat(this.applicationsByCategory[directory]);
       }
       
       var res;
       if (pattern) {
           res = new Array();
           for (var i in applist) {
               let app = applist[i];
               if (app.get_name().toLowerCase().indexOf(pattern)!=-1 || 
                  (app.get_description() && app.get_description().toLowerCase().indexOf(pattern)!=-1)) 
                   res.push(app);
            }
        } else res = applist;
       
        return res;
    },
    
    _doSearch: function() {
        this._searchTimeoutId = 0;
        let pattern = this.searchEntryText.get_text().replace(/^\s+/g, '').replace(/\s+$/g, '').toLowerCase();
       
        var appResults = this._listApplications(null, pattern);
       
        var placesResults = new Array();
       
        var bookmarks = this._listBookmarks(pattern);
        for (var i in bookmarks)
            placesResults.push(bookmarks[i]);
       
        var devices = this._listDevices(pattern);
        for (var i in devices) 
            placesResults.push(devices[i]);
       
        this._clearApplicationsBox();
        this._displayButtons(appResults, placesResults);

        return false;
    }
};



function GreatMenu(metadata) {
    this._init(metadata);
}

GreatMenu.prototype = {

    _init: function(metadata) {
    
        this._menuOrientation = St.Side.TOP;
        this._iconPath = metadata.path + '/icons/';
    
        // is bottom panel extension enabled?
        let settings = new Gio.Settings({ schema: 'org.gnome.shell' });
        let enabled_extensions = settings.get_strv('enabled-extensions');
        if (enabled_extensions.indexOf("bottompanel@linuxmint.com") != -1) {
            this._menuOrientation = St.Side.BOTTOM;
        }
    }, 

    enable: function() {  
        this._appsMenuButton = new ApplicationsButton(this._iconPath, this._menuOrientation); 

        Main.panel._leftBox.insert_actor(this._appsMenuButton.actor, 1);    
        Main.panel._menus.addMenu(this._appsMenuButton.menu);
        Main.panel._mintMenu = this._appsMenuButton;
    
        // check for mintPanel 
        if (Main.panel._mintPanel != null) {
            Main.panel._mintPanel.moveMe(this._appsMenuButton);
            global.log("GreatMenu found mintPanel");
        }
    },

    disable: function() {
        Main.panel._leftBox.remove_actor(this._appsMenuButton.actor);    
        Main.panel._menus.removeMenu(this._appsMenuButton.menu);    
    }
};


function init(metadata) {
    return new GreatMenu(metadata);
}
