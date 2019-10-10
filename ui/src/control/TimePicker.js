sap.ui.define([
  'sap/m/TimePicker',
	'sap/ui/core/EnabledPropagator',
  'sap/m/MaskEnabler',
  'jquery.sap.global',
  'com/ui5/dotproject/timecard/thirdparty/cursorPos'
],
  function (TimePicker, EnabledPropagator, MaskEnabler) {
    "use strict";

    var CTimePicker = TimePicker.extend("com.ui5.dotproject.timecard.control.TimePicker", /** @lends com.ui5.dotproject.timecard.control.TimePicker.prototype */ {
      renderer: {}
    });

		EnabledPropagator.call(CTimePicker.prototype, true);
		MaskEnabler.call(CTimePicker.prototype);

		CTimePicker.prototype.init = function() {
      TimePicker.prototype.init.apply(this, arguments);
    };
    
    CTimePicker.prototype.setValue = function(sValue) {
      if (TimePicker.prototype.setValue) {
        TimePicker.prototype.setValue.apply(this, arguments);
      }
			return this;
		};

		CTimePicker.prototype.onAfterRendering = function() {
      if (TimePicker.prototype.onAfterRendering) {
        TimePicker.prototype.onAfterRendering.apply(this, arguments);
      }
      this._$input.attr("type", "tel");
    };

    return CTimePicker;
  });
