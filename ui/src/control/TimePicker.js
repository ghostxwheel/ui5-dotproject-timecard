sap.ui.define([
  'jquery.sap.global',
  'sap/m/Input',
  'sap/ui/Device',
  'com/ui5/dotproject/timecard/thirdparty/jquery.mask.min'
],
  function (jQuery, Input, Device) {
    "use strict";

    var CTimePicker = Input.extend("com.ui5.dotproject.timecard.control.TimePicker", {
      renderer: {},
      
      onAfterRendering: function () {
        this._$input.attr("type", "tel");
        this._$input.mask("99:99");
      }
    });

    CTimePicker.prototype.onfocusin = function(oEvent) {
      if (Input.prototype.onfocusin) {
        Input.prototype.onfocusin.apply(this, arguments);
      }
      
      this._$input.select();
    };

    CTimePicker.prototype.onkeydown = function (oEvent) {
      if (Input.prototype.onkeydown) {
        Input.prototype.onkeydown.apply(this, arguments);
      }

      this.setValue(this._$input.val());
    }

    return CTimePicker;

  }, /* bExport= */ true);
