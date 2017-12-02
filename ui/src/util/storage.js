sap.ui.define([
  "jquery.sap.global",
  "jquery.sap.storage"
], function(jQuery) {
  var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
  
  return {
    put: function(oModel) {
      oStorage.put("settings", oModel.getProperty("/"));
    },
    
    pull: function(oModel) {
      var oSettings = oStorage.get("settings");

      if (oSettings) {
        if (oSettings.hoursMinimum 
            && typeof oSettings.hoursMinimum === "object"
            && oSettings.hoursMinimum !== null) {
          oModel.setProperty("/hoursMinimum", oSettings.hoursMinimum);
        }
        
        if (oSettings.hoursMinimumCurrent) {
          oModel.setProperty("/hoursMinimumCurrent", oSettings.hoursMinimumCurrent);
        }

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
    }
  };
});