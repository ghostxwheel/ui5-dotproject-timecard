sap.ui.define([], function() {
  "use strict";

  return {
    getApiPostData: function(oSettingsModel) {
      return {
        url: oSettingsModel.getProperty("/fullUrl"),
        username: oSettingsModel.getProperty("/username"),
        password: oSettingsModel.getProperty("/password")
      };
    },

    setLoginStatusSuccess: function(oComponent) {
      var oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
      var oTimecardModel = oComponent.getModel("timecard");

      oTimecardModel.setProperty("/loginStatusIcon", "sap-icon://message-success");
      oTimecardModel.setProperty("/loginStatusIconColor", "green");
      oTimecardModel.setProperty("/loginStatusIconTooltip", oResourceBundle.getText("loginStatusSuccessTooltip"));
    },

    setLoginStatusError: function(oComponent) {
      var oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
      var oTimecardModel = oComponent.getModel("timecard");

      oTimecardModel.setProperty("/loginStatusIcon", "sap-icon://message-error");
      oTimecardModel.setProperty("/loginStatusIconColor", "red");
      oTimecardModel.setProperty("/loginStatusIconTooltip", oResourceBundle.getText("loginStatusErrorTooltip"));
    }
  };
});