sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "com/sap/dotproject/timecard/model/helpers",
  "sap/m/MessageToast",
  "sap/ui/core/message/ControlMessageProcessor",
  "sap/ui/core/message/Message",
  "sap/ui/core/MessageType"
], function (Controller, helpers, MessageToast, ControlMessageProcessor, Message, MessageType) {
  "use strict";

  return Controller.extend("com.sap.dotproject.timecard.controller.Main", {
    onInit: function () {
      var oMessageManager = sap.ui.getCore().getMessageManager();
      var oComponent = this.getOwnerComponent();
      var oTimecardModel = oComponent.getModel("timecard");
      var oSettingsModel = oComponent.getModel("settings");

      oTimecardModel.setProperty("/statusId", oSettingsModel.getProperty("/defaultStatusId"));

      oMessageManager.registerObject(this.getView(), true);
    },

    onSettings: function (oEvent) {
      var oComponent = this.getOwnerComponent();
      var oRouter = oComponent.getRouter();

      oRouter.navTo("settings");
    },

    validateInput: function () {
      var oComponent = this.getOwnerComponent();
      var oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
      var oTimecardModel = oComponent.getModel("timecard");
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

      if (oTimecardModel.getProperty("/timeBegin") === "") {
        arrMessages.push({
          message: oResourceBundle.getText("timeBeginMandatoryError"),
          type: MessageType.Error,
          processor: oMessageProcessor
        });
      }

      if (oTimecardModel.getProperty("/timeEnd") === "") {
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

    onReport: function (oEvent) {
      var oComponent, oTimecardModel, oSettingsModel, oResourceBundle,
        strSelectedStatusId, arrStatuses, oStatus, oFormData,
        oMessageManager, oMessageProcessor;

      if (!this.validateInput()) {
        this.onMessagePopover();

        return;
      }

      oComponent = this.getOwnerComponent();
      oTimecardModel = oComponent.getModel("timecard");
      oSettingsModel = oComponent.getModel("settings");
      oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
      strSelectedStatusId = oTimecardModel.getProperty("/statusId");
      arrStatuses = oSettingsModel.getProperty("/statuses");
      oStatus = null;
      oFormData = null
      oMessageManager = sap.ui.getCore().getMessageManager();
      oMessageProcessor = new ControlMessageProcessor();

      oMessageManager.registerMessageProcessor(oMessageProcessor);

      oStatus = arrStatuses.filter(function (oStatus) {
        return oStatus.statusId === parseInt(strSelectedStatusId, 10);
      })[0];

      oFormData = {
        date: oTimecardModel.getProperty("/date"),
        timeBegin: oTimecardModel.getProperty("/timeBegin"),
        timeEnd: oTimecardModel.getProperty("/timeEnd"),
        taskId: oStatus.taskId,
        description: oStatus.description,
      };

      oFormData = jQuery.extend(true, oFormData, helpers.getApiPostData(oSettingsModel));

      oMessageManager.removeAllMessages();
      this.getView().setBusy(true);

      jQuery.ajax("/api/timecard", {
        method: "POST",
        data: oFormData,
        success: function (oData) {

          this.getView().setBusy(false);

          oMessageManager.addMessages(new Message({
            message: oResourceBundle.getText("reportSuccessMessage"),
            type: MessageType.Success,
            processor: oMessageProcessor
          }));

          this.onMessagePopover();

        }.bind(this),
        error: function (oError) {
          
          this.getView().setBusy(false);

          oMessageManager.addMessages(new Message({
            message: oResourceBundle.getText("reportErrorMessage"),
            type: MessageType.Error,
            processor: oMessageProcessor
          }));
          
          oMessageManager.addMessages(new Message({
            message: oError.responseText,
            type: MessageType.Error,
            processor: oMessageProcessor
          }));

          this.onMessagePopover();

        }.bind(this),
      })
    },

    onMessagePopover: function (oEvent) {
      var oView = this.getView();
      var oDialog = oView.byId("idMessagePopover");

      if (!oDialog) {
        oDialog = sap.ui.xmlfragment(oView.getId(), "com.sap.dotproject.timecard.view.MessagePopover", this);

        oView.addDependent(oDialog);
      }

      oDialog.toggle(this.getView().byId("idMessagePopoverButton"));
    }
  });
});