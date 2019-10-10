sap.ui.define([
  'jquery.sap.global',
  'sap/m/TimePicker',
  'sap/ui/Device',
  // 'com/ui5/dotproject/timecard/thirdparty/jquery.mask.min',
  'com/ui5/dotproject/timecard/thirdparty/cursorPos'
],
  function (jQuery, TimePicker, Device) {
    "use strict";

    var CTimePicker = TimePicker.extend("com.ui5.dotproject.timecard.control.TimePicker", {
      renderer: {},
      
      onAfterRendering: function () {
        this._$input.attr("type", "tel");
      }
    });

    CTimePicker.prototype.onfocusin = function(oEvent) {
      if (TimePicker.prototype.onfocusin) {
        TimePicker.prototype.onfocusin.apply(this, arguments);
      }
    };

    return CTimePicker;

  }, /* bExport= */ true);
