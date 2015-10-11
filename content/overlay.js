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

    window.removeEventListener('current_view_changed', extensions.addEOL);
    window.removeEventListener('focus', extensions.addEOL);
    window.removeEventListener('view_opened', extensions.checkEOL);

    $("#statusbar-eol").remove();
    $("#statusbar-encoding").before($("<statusbarpanel id='statusbar-eol'/>"));

    var panel   = $('#statusbar-eol');
    panel.append("<label class='statusbarpanel-text'/>");
    var label = $('#statusbar-eol > label');

    var timer, timerRunning;
    extensions.addEOL = function(){
        if (timerRunning) return;
        timer = setTimeout(addEOL, 500);
        timerRunning = true;
    };
    
    extensions.checkEOL = function() {
        var scimoz = ko.views.manager.currentView.scimoz;
        if (scimoz == undefined) {
            return;
        }
        var fileEOL 	= eol[scimoz.eOLMode];
        var globalEOL 	= ko.prefs.getString('endOfLine');
        if (fileEOL !== globalEOL) {
            notify.send(
                'Current file EOL ' + fileEOL + ' mismatch global configuration ' + globalEOL,
                'line-endings-event',
                1000,
                false
            );
        }
    }

    window.addEventListener('current_view_changed', extensions.addEOL);
    window.addEventListener('focus', extensions.addEOL);
    window.addEventListener('view_opened', extensions.checkEOL);

    function addEOL() {
        timerRunning = false;
        var scimoz = ko.views.manager.currentView.scimoz;
        if (scimoz == undefined){
            return;
        }
        
        label.attr('value', eol[scimoz.eOLMode]);
    }

}).apply(extensions.EOL_widget);
