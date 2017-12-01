sap.ui.define([
  'jquery.sap.global',
  'sap/ui/unified/Calendar'
],
  function (jQuery, Calendar) {
    "use strict";

    var CCalendar = Calendar.extend("com.ui5.dotproject.timecard.control.Calendar", {
      renderer: {}
    });
    
//CCalendar.prototype.onsapfocusleave = function () {
//  
//};

    return CCalendar;

  }, /* bExport= */ true);
