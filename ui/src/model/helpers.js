sap.ui.define([
  "sap/ui/core/format/DateFormat",
  "sap/ui/core/message/ControlMessageProcessor",
  "sap/ui/core/message/Message",
  "sap/ui/core/MessageType"
], function(DateFormat, ControlMessageProcessor, Message, MessageType) {
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
    },

    getDaysInMonth: function (oDate) {
      var oNewDate = new Date(oDate.getFullYear(), oDate.getMonth() + 1, 0);
      return oNewDate.getDate();
    },

    parseDate: function (strDate) {
      var oDateFormatter = DateFormat.getDateInstance({ pattern: "dd/MM/yyyy" });

      return oDateFormatter.parse(strDate);
    },

    reportValidateInput: function (oContoller) {
      var oComponent = oContoller.getOwnerComponent();
      var oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
      var oTimecardModel = oComponent.getModel("timecard");
      var oSettingsModel = oComponent.getModel("settings");
      var arrMessages = [];
      var oMessageManager = sap.ui.getCore().getMessageManager();
      var oMessageProcessor = new ControlMessageProcessor();

      oMessageManager.registerMessageProcessor(oMessageProcessor);

      if (oTimecardModel.getProperty("/statusId") === 0) {
        arrMessages.push({
          message: oResourceBundle.getText("statusMandatoryError"),
          type: MessageType.Error,
          processor: oMessageProcessor
        });
      }

      if (oTimecardModel.getProperty("/date") === "") {
        arrMessages.push({
          message: oResourceBundle.getText("dateMandatoryError"),
          type: MessageType.Error,
          processor: oMessageProcessor
        });
      }

      if (oSettingsModel.getProperty("/timeBegin") === "") {
        arrMessages.push({
          message: oResourceBundle.getText("timeBeginMandatoryError"),
          type: MessageType.Error,
          processor: oMessageProcessor
        });
      }

      if (oSettingsModel.getProperty("/timeEnd") === "") {
        arrMessages.push({
          message: oResourceBundle.getText("timeEndMandatoryError"),
          type: MessageType.Error,
          processor: oMessageProcessor
        });
      }

      if (arrMessages.length === 0) {
        return true;
      } else {
        oMessageManager.removeAllMessages();

        arrMessages.forEach(function (oMessage) {
          oMessageManager.addMessages(new Message(oMessage));
        });

        return false;
      }
    },

    massReportValidateInput: function (oContoller, oRecord) {
      var oComponent = oContoller.getOwnerComponent();
      var oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
      var arrMessages = [];
      var oMessageManager = sap.ui.getCore().getMessageManager();
      var oMessageProcessor = new ControlMessageProcessor();

      oMessageManager.registerMessageProcessor(oMessageProcessor);

      if (oRecord.status !== 0 
          || oRecord.timeBegin !== "" 
          || oRecord.timeEnd !== "") {

        if (oRecord.status === 0) {
          arrMessages.push({
            message: oResourceBundle.getText("statusMandatoryError"),
            type: MessageType.Error,
            processor: oMessageProcessor
          });
        }

        if (oRecord.timeBegin === "") {
          arrMessages.push({
            message: oResourceBundle.getText("timeBeginMandatoryError"),
            type: MessageType.Error,
            processor: oMessageProcessor
          });
        }

        if (oRecord.timeEnd === "") {
          arrMessages.push({
            message: oResourceBundle.getText("timeEndMandatoryError"),
            type: MessageType.Error,
            processor: oMessageProcessor
          });
        }

      }

      if (arrMessages.length === 0) {
        return true;
      } else {
        oMessageManager.removeAllMessages();

        arrMessages.forEach(function (oMessage) {
          oMessageManager.addMessages(new Message(oMessage));
        });

        return false;
      }
    },
  };
});