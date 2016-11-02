/**
 * Namespaces
 */
if (typeof(extensions) === 'undefined') extensions = {};
if (typeof(extensions.EOL_widget) === 'undefined') extensions.EOL_widget = {
	version: '2.1'
};

(function() {
	
    var $       	= require("ko/dom"),
		notify		= require("notify/notify"),
		eol     	= ['CRLF', 'CR', 'LF'],
		self		= this;
	
	
    window.removeEventListener('current_view_changed', this.addEOL);
    window.removeEventListener('focus', this.addEOL);
    window.removeEventListener('view_opened', this.checkEOL);
	
	this.addPanel = function(){
		var view 	= $(require("ko/views").current().get()),
		EOLpanel	= $("<statusbarpanel id='eol_widget' />"),
		menu 		= $('<menupopup id="statusbar-eol-menupopup"/>'),
		itemCRLF 	= $('<menuitem label="CRLF" oncommand="extensions.EOL_widget.setEol(\'CRLF\');" />'),
		itemLF		= $('<menuitem label="LF" oncommand="extensions.EOL_widget.setEol(\'LF\');" />'),
		item		= $('<menuitem label="CR" oncommand="extensions.EOL_widget.setEol(\'CR\');" />');
		
		view.findAnonymous("anonid", "statusbar-encoding").before(EOLpanel);
		
		menu.append(itemCRLF);
		menu.append(itemLF); 
		menu.append(item);
		
		var panel   = view.find('#eol_widget');
		
		panel.append('<toolbarbutton class="statusbar-label" id="statusbar-eol-label" flex="1" orient="horizontal" type="menu" persist="buttonstyle" buttonstyle="text" label="" />');
		
		var button = $('#eol_widget > #statusbar-eol-label');
		
		button.append(menu);
		
	}
	
    this.addEOL = function(){ 
		var view 	= require('ko/views').current(),
			prefs 	= view.prefs,
			currV	= require("ko/views").current().get(),
			panel   = $(currV).find('#eol_widget'),
			button 	= $(currV).find('#statusbar-eol-label');
			
		if (view.length === 0){
            return;
        }
		
		if (panel.length === 0){
			self.addPanel();
			button 	= $(currV).find('#statusbar-eol-label');
		}
		
		var scimoz = view.scimoz;
        if (scimoz === undefined){
            return;
        }
		
        button.attr('label', prefs.getString('endOfLine'));
    };
    
    this.checkEOL = function() {
		var view 	= require('ko/views').current(),
			prefs 	= view.prefs;
			
		if (view.length === 0){
            return;
        }
		
		var scimoz = view.scimoz;
        if (scimoz === undefined){
            return;
        }
		
		if ( ! prefs) return;
		
		
        var fileEOL 	= prefs.getString('endOfLine'),
			globalEOL 	= ko.prefs.getString('endOfLine');
        if (fileEOL !== globalEOL) {
            notify.send(
                'Current file EOL ' + fileEOL + ' mismatch global configuration ' + globalEOL,
                'tools'
            );
        }
    }
	
	this.setEol = function(value) {
		var view		= require('ko/views').current(),
			koDoc 		= view.koDoc,
			prefs 		= view.prefs,
			pref 		= Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService).getBranch("extensions.EOL_widget."),
			override	= pref.getBoolPref('preserveExisting') ? false : true;
		if ( ! prefs) return;
		
		prefs.setString('endOfLine', value);

		eol = koDoc.EOL_LF; 
		if (value == "CR")
			eol = koDoc.EOL_CR;
		else if (value == "CRLF")
			eol = koDoc.EOL_CRLF;
		koDoc.new_line_endings = eol;
		
		if (override) koDoc.existing_line_endings = eol;
		
		this.addEOL();
	}


    window.addEventListener('current_view_changed', this.addEOL);
    window.addEventListener('focus', this.addEOL);
    window.addEventListener('view_opened', this.checkEOL);

}).apply(extensions.EOL_widget);
