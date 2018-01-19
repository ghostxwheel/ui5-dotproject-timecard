sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/ui/Device",
  "sap/ui/core/format/DateFormat",
  "com/ui5/dotproject/timecard/util/storage"
], function(JSONModel, Device, DateFormat, storage) {
  "use strict";

  return {

    createDeviceModel: function() {
      var oModel = new JSONModel(Device);
      oModel.setDefaultBindingMode("OneWay");
      return oModel;
    },
    
    createTimecardModel: function(oComponent) {
      var oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
      var oDateNow = new Date();
      var oDateFormatter = DateFormat.getDateInstance({
        pattern: "dd/MM/yyyy"
      });

      var oModel = new JSONModel({
        readOnly: false,
        footerToolbarVisible: true,
        currentMonthDescription: oResourceBundle.getText("month" + new Date().getMonth()),
        currentMonth: new Date().getMonth() + 1,
        currentYear: new Date().getFullYear(),
        hoursWorked: 0,
        hoursReported: [],
        loginStatusIcon: "sap-icon://message-warning",
        loginStatusIconColor: "yellow",
        loginStatusIconTooltip: oResourceBundle.getText("loginStatusWarningTooltip"),
        statusId: 0,
        date: oDateFormatter.format(oDateNow)
      });

      return oModel;
    },

    createSettingsModel: function() {
      var oModel = new JSONModel({
        hoursMinimum: {
          "default": 186
        },
        hoursMinimumCurrent: 186,
        fullUrl: "http://",
        username: "",
        password: "",
        statuses: [],
        defaultStatusId: 0,
        timeBegin: "08:00",
        timeEnd: "17:30"
      });
      
      storage.pull(oModel);

      return oModel;
    },

    createSettingsReadOnlyModel: function(oSettingsModel) {
      var oModel = new JSONModel({
        commonTaskStatuses: []
      });

      return oModel;
    },

    createAddStatusDialogModel: function() {
      var oModel = new JSONModel({
        name: ""
      });

      return oModel;
    },

    createValueHelpDialogModel: function() {
      var oModel = new JSONModel({
        noDataText: "",
        title: "",
        items: []
      });

      return oModel;
    }

  };
});