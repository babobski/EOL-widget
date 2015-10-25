/**
 * Namespaces
 */
if (typeof(extensions) === 'undefined') extensions = {};
if (typeof(extensions.EOL_widget) === 'undefined') extensions.EOL_widget = {
	version: '1.0'
};

(function() {
	
    var $       = require("ko/dom");
	var notify	= require("notify/notify");
    var eol     = ['CRLF', 'CR', 'LF'];
 
    window.removeEventListener('current_view_changed', this.addEOL);
    window.removeEventListener('focus', this.addEOL);
    window.removeEventListener('view_opened', this.checkEOL);

    $("#statusbar-eol").remove();
    $("#statusbar-encoding").before($("<statusbarpanel tooltiptext='File Line Ending' id='statusbar-eol'/>"));
	var menu 		= $('<menupopup id="statusbar-eol-menupopup"/>');
	var itemCRLF 	= $('<menuitem label="CRLF" oncommand="extensions.EOL_widget.setEol(\'CRLF\');" />');
	var itemLF		= $('<menuitem label="LF" oncommand="extensions.EOL_widget.setEol(\'LF\');" />');
	var item		= $('<menuitem label="CR" oncommand="extensions.EOL_widget.setEol(\'CR\');" />');
	menu.append(itemCRLF);
	menu.append(itemLF); 
	menu.append(item);
	
    var panel   	= $('#statusbar-eol');
    panel.append('<toolbarbutton class="statusbar-label" id="statusbar-eol-label" flex="1" orient="horizontal" type="menu" persist="buttonstyle" buttonstyle="text" label="" />');
    var button = $('#statusbar-eol > #statusbar-eol-label');
	
	button.append(menu); 

    var timer, timerRunning;
    this.addEOL = function(){ 
		var koDoc 	= require('ko/views').current().koDoc;
		var prefs 	= require('ko/views').current().prefs;
        var view = ko.views.manager.currentView;
		if (view == null){
            return;
        }
		var scimoz = view.scimoz;
        if (scimoz === undefined){
            return;
        }
        
        button.attr('label', prefs.getString('endOfLine'));
    };
    
    this.checkEOL = function() {
       var view = ko.views.manager.currentView;
	   var koDoc 	= require('ko/views').current().koDoc;
		var prefs 	= require('ko/views').current().prefs;
		if (view == null){
            return;
        }
		var scimoz = view.scimoz;
        if (scimoz === undefined){
            return;
        }
		
		var prefs = require('ko/views').current().prefs; 
		if ( ! prefs) return;
		
		
        var fileEOL 	= prefs.getString('endOfLine');
        var globalEOL 	= ko.prefs.getString('endOfLine');
        if (fileEOL !== globalEOL) {
            notify.send(
                'Current file EOL ' + fileEOL + ' mismatch global configuration ' + globalEOL,
                'tools'
            );
        }
    }
	
	this.setEol = function(value) {
		var koDoc 		= require('ko/views').current().koDoc;
		var prefs 		= require('ko/views').current().prefs;
		var pref 		= Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefService).getBranch("extensions.EOL_widget.");
		var override	= pref.getBoolPref('preserveExisting') ? false : true;
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
