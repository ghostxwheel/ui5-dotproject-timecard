sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/Device",
  "com/ui5/dotproject/timecard/model/models"
], function (UIComponent, Device, models) {
  "use strict";

  return UIComponent.extend("com.ui5.dotproject.timecard.Component", {
    
    _sContentDensityClass: null,

    metadata: {
      manifest: "json"
    },

    /**
     * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
     * @public
     * @override
     */
    init: function () {
      // call the base component's init function
      UIComponent.prototype.init.apply(this, arguments);

      this.setModel(models.createDeviceModel(), "device");
      this.setModel(models.createTimecardModel(this), "timecard");
      this.setModel(models.createSettingsModel(), "settings");
      this.setModel(models.createAddStatusDialogModel(), "addStatusDialog");
      this.setModel(models.createValueHelpDialogModel(), "valueHelpDialog");
      this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "messages");

      // initialize router
      this.getRouter().initialize();
    },

    getContentDensityClass: function () {
      if (!this._sContentDensityClass) {
        if (!sap.ui.Device.support.touch) {
          this._sContentDensityClass = "sapUiSizeCompact";
        } else {
          this._sContentDensityClass = "sapUiSizeCozy";
        }
      }
      return this._sContentDensityClass;
    }
  });
});