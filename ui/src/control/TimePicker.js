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
      renderer: {},
      
      onAfterRendering: function () {
        this._$input.attr("type", "tel");
      }
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

    return CTimePicker;
  });
