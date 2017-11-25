sap.ui.define([], function () {
  "use strict";

  return {
    getApiPostData: function (oSettingsModel) {
      return {
        url: oSettingsModel.getProperty("/fullUrl"),
        username: oSettingsModel.getProperty("/username"),
        password: oSettingsModel.getProperty("/password"),
      };
    }
  };
  
});