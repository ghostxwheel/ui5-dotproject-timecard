sap.ui.define([
  "sap/ui/base/ManagedObject",
  "sap/ui/core/message/ControlMessageProcessor",
  "sap/ui/core/message/Message",
  "sap/ui/core/MessageType",
  "com/ui5/dotproject/timecard/util/storage",
  "com/ui5/dotproject/timecard/model/helpers"
], function (ManagedObject, ControlMessageProcessor, Message, MessageType, storage, helpers) {
  "use strict";

  var ReportHoursDialog = ManagedObject.extend("com.ui5.dotproject.timecard.controller.ReportHoursDialog", {
    constructor: function (oView) {
			this._oView = oView;	
		},

		open: function () {
			var oView = this._oView;
			var oDialog = oView.byId("reportHoursDialog");
			
			if (!oDialog) {
        oDialog = sap.ui.xmlfragment(oView.getId(), "com.ui5.dotproject.timecard.view.ReportHoursDialog", this);
        
        oView.addDependent(oDialog);

        // forward compact/cozy style into dialog
        jQuery.sap.syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oDialog);
      }
      
			oDialog.open();
    },

    getOwnerComponent: function () {
      return this._oView.getController().getOwnerComponent();
    },

    validateInput: function () {
      var oComponent = this.getOwnerComponent();
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

    onReport: function () {
      var oComponent, oTimecardModel, oSettingsModel, oResourceBundle,
        strSelectedStatusId, arrStatuses, oStatus, oFormData,
        oMessageManager, oMessageProcessor, oSettingsModelRO, oDialog, oView;

      oView = this._oView;
      oDialog = oView.byId("reportHoursDialog");

      if (!this.validateInput()) {
        oView.getController().onMessagePopover();

        return;
      }

      oComponent = this.getOwnerComponent();
      oTimecardModel = oComponent.getModel("timecard");
      oSettingsModel = oComponent.getModel("settings");
      oSettingsModelRO = oComponent.getModel("settingsReadOnly");
      oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
      strSelectedStatusId = oTimecardModel.getProperty("/statusId");
      arrStatuses = oSettingsModelRO.getProperty("/statuses");
      oStatus = null;
      oFormData = null;
      oMessageManager = sap.ui.getCore().getMessageManager();
      oMessageProcessor = new ControlMessageProcessor();

      oMessageManager.registerMessageProcessor(oMessageProcessor);

      oStatus = arrStatuses.filter(function (oArrayStatus) {
        return oArrayStatus.statusId === parseInt(strSelectedStatusId, 10);
      })[0];

      oFormData = {
        date: oTimecardModel.getProperty("/date"),
        timeBegin: oSettingsModel.getProperty("/timeBegin"),
        timeEnd: oSettingsModel.getProperty("/timeEnd"),
        taskId: oStatus.taskId,
        description: oStatus.description
      };

      oFormData = jQuery.extend(true, oFormData, helpers.getApiPostData(oSettingsModel));

      oMessageManager.removeAllMessages();
      oDialog.setBusy(true);

      jQuery.ajax("/api/timecard", {
        method: "POST",
        data: oFormData,
        success: function (oData) {
          oDialog.setBusy(false);

          oMessageManager.addMessages(new Message({
            message: oResourceBundle.getText("reportSuccessMessage"),
            type: MessageType.Success,
            processor: oMessageProcessor
          }));

          oView.getController().refreshReportTableData();
          oView.getController().onMessagePopover();

          oSettingsModel.setProperty("/defaultStatusId", oStatus.statusId);
          storage.put(oSettingsModel);

          oDialog.close();
        },
        error: function (oError) {
          oDialog.setBusy(false);

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

          oView.getController().refreshReportTableData();
          oView.getController().onMessagePopover();

          oDialog.close();
        }
      });
    },
    
    onClose: function () {
			var oView = this._oView;
      var oDialog = oView.byId("reportHoursDialog");

      oDialog.close();
    },

		exit: function () {
			delete this._oView;
		}
  });

  return ReportHoursDialog;
}, true);