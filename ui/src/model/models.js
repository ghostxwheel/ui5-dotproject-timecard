sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/ui/Device",
  "sap/ui/core/format/DateFormat",
  "jquery.sap.global",
  "jquery.sap.storage"
], function(JSONModel, Device, DateFormat, jQuery) {
  "use strict";

  return {

    createDeviceModel: function() {
      var oModel = new JSONModel(Device);
      oModel.setDefaultBindingMode("OneWay");
      return oModel;
    },
    
    createTimecardModel: function() {
      var oDateNow = new Date();
      var oDateFormatter = DateFormat.getDateInstance({
        pattern: "dd/MM/yyyy"
      });

      var oModel = new JSONModel({
        statusId: 0,
        date: oDateFormatter.format(oDateNow),
        timeBegin: "08:00",
        timeEnd: "17:30"  
      });

      return oModel;
    },

    createSettingsModel: function() {
      var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
      var oModel = new JSONModel({
        fullUrl: "http://",
        username: "",
        password: "",
        statuses: [],
        defaultStatusId: 0
      });

      var oSettings = oStorage.get("settings");

      if (oSettings) {
        if (oSettings.fullUrl) {
          oModel.setProperty("/fullUrl", oSettings.fullUrl);
        }

        if (oSettings.username) {
          oModel.setProperty("/username", oSettings.username);
        }

        if (oSettings.password) {
          oModel.setProperty("/password", oSettings.password);
        }

        if (oSettings.statuses) {
          oModel.setProperty("/statuses", oSettings.statuses);
        }

        if (oSettings.defaultStatusId) {
          oModel.setProperty("/defaultStatusId", oSettings.defaultStatusId);
        }
      }

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