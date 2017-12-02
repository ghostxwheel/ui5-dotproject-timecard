sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "com/ui5/dotproject/timecard/model/helpers",
  "sap/m/MessageToast",
  "sap/ui/core/message/ControlMessageProcessor",
  "sap/ui/core/message/Message",
  "sap/ui/core/MessageType",
  "com/ui5/dotproject/timecard/util/formatter",
  "com/ui5/dotproject/timecard/util/storage"
], function (Controller, helpers, MessageToast, ControlMessageProcessor, Message, MessageType, formatter, storage) {
  "use strict";

  return Controller.extend("com.ui5.dotproject.timecard.controller.Main", {
    formatter: formatter,

    onInit: function () {
      var oMessageManager = sap.ui.getCore().getMessageManager();
      var oComponent = this.getOwnerComponent();
      var oTimecardModel = oComponent.getModel("timecard");
      var oSettingsModel = oComponent.getModel("settings");

      oTimecardModel.setProperty("/statusId", oSettingsModel.getProperty("/defaultStatusId"));

      oMessageManager.registerObject(this.getView(), true);

      this.removeCalendarEventHandlers();
      this.loginCheck();
      this.refreshReportTableData();
    },
    
    refreshReportStatsData: function () {
      var oComponent = this.getOwnerComponent();
      var oTimecardModel = oComponent.getModel("timecard");
      var oSettingsModel = oComponent.getModel("settings");
      var oPostData = helpers.getApiPostData(oSettingsModel);

      if (oPostData.url !== "" && oPostData.username !== "" && oPostData.password !== "") {
        this.getView().setBusy(true);

        oPostData.year = oTimecardModel.getProperty("/currentYear");
        oPostData.month = oTimecardModel.getProperty("/currentMonth");
        
        var strKey = oPostData.month + "/" + oPostData.year;
        var arrHoursMinimum = oSettingsModel.getProperty("/hoursMinimum");
        var strHoursMinimumCurrent = arrHoursMinimum[strKey] || arrHoursMinimum["default"];
  
        oSettingsModel.setProperty("/hoursMinimumCurrent", strHoursMinimumCurrent);

        jQuery.ajax("/api/stats", {
          method: "POST",
          data: oPostData,
          success: function (oStatsData) {
            this.getView().setBusy(false);

            oTimecardModel.setProperty("/hoursWorked", oStatsData.hoursWorkedTotal);
          }.bind(this),
          error: function () {
            this.getView().setBusy(false);

            oTimecardModel.setProperty("/hoursWorked", 0);
          }.bind(this)
        });
      }
    },

    refreshReportTableData: function () {
      var oComponent = this.getOwnerComponent();
      var oTimecardModel = oComponent.getModel("timecard");
      var oSettingsModel = oComponent.getModel("settings");
      var oPostData = helpers.getApiPostData(oSettingsModel);
      
      this.refreshReportStatsData();

      if (oPostData.url !== "" && oPostData.username !== "" && oPostData.password !== "") {
        this.getView().setBusy(true);

        oPostData.year = oTimecardModel.getProperty("/currentYear");
        oPostData.month = oTimecardModel.getProperty("/currentMonth");

        jQuery.ajax("/api/report", {
          method: "POST",
          data: oPostData,
          success: function (oArrData) {
            this.getView().setBusy(false);
            var arrStatuses = oSettingsModel.getProperty("/statuses");

            var arrHoursReported = oArrData.map(function (oArrData) {
              var oAdditionalData = {};
              var arrFilteredStatus = arrStatuses.filter(function (oStatus) {
                return (parseInt(oStatus.companyId) === oArrData.companyId
                  && parseInt(oStatus.projectId) === oArrData.projectId
                  && parseInt(oStatus.taskId) === oArrData.taskId
                  && oStatus.description === oArrData.description);
              });

              if (arrFilteredStatus.length > 0) {
                oAdditionalData.status = arrFilteredStatus[0].title;
              }

              oArrData.hoursWorked = parseFloat(oArrData.hoursWorked).toFixed(2).toString();

              return jQuery.extend(true, oArrData, oAdditionalData);
            });

            oTimecardModel.setProperty("/hoursReported", arrHoursReported);
          }.bind(this),
          error: function () {
            this.getView().setBusy(false);

            oTimecardModel.setProperty("/hoursReported", []);
          }.bind(this)
        });
      }
    },

    loginCheck: function () {
      var oComponent = this.getOwnerComponent();
      var oSettingsModel = oComponent.getModel("settings");
      var oPostData = helpers.getApiPostData(oSettingsModel);

      if (oPostData.url === "" || oPostData.username === "" || oPostData.password === "") {
        helpers.setLoginStatusError(oComponent);
      } else {
        jQuery.ajax("/api/loginCheck", {
          method: "POST",
          data: oPostData,
          success: function () {
            helpers.setLoginStatusSuccess(oComponent);
          },
          error: function () {
            helpers.setLoginStatusError(oComponent);
          }
        });
      }
    },

    removeCalendarEventHandlers: function () {
      var oCalendar = this.getView().byId("idCalendar");
      var oCalHead = sap.ui.getCore().byId(oCalendar.getId() + "--Head");
      var oCalMonth = sap.ui.getCore().byId(oCalendar.getId() + "--Month0");

      oCalMonth.addEventDelegate({
        onAfterRendering: function (oEvent) {
          oEvent.srcControl.$().css("display", "none");
        }
      });

      var oListener = oCalHead.mEventRegistry["pressButton1"][0];
      oCalHead.detachPressButton1(oListener.fFunction, oListener.oListener);

      oListener = oCalHead.mEventRegistry["pressButton2"][0];
      oCalHead.detachPressButton2(oListener.fFunction, oListener.oListener);
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
      oFormData = null;
      oMessageManager = sap.ui.getCore().getMessageManager();
      oMessageProcessor = new ControlMessageProcessor();

      oMessageManager.registerMessageProcessor(oMessageProcessor);

      oStatus = arrStatuses.filter(function (oArrayStatus) {
        return oArrayStatus.statusId === parseInt(strSelectedStatusId, 10);
      })[0];

      oFormData = {
        date: oTimecardModel.getProperty("/date"),
        timeBegin: oTimecardModel.getProperty("/timeBegin"),
        timeEnd: oTimecardModel.getProperty("/timeEnd"),
        taskId: oStatus.taskId,
        description: oStatus.description
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
        }.bind(this)
      });
    },

    onMessagePopover: function (oEvent) {
      var oView = this.getView();
      var oDialog = oView.byId("idMessagePopover");

      if (!oDialog) {
        oDialog = sap.ui.xmlfragment(oView.getId(), "com.ui5.dotproject.timecard.view.MessagePopover", this);

        oView.addDependent(oDialog);
      }

      oDialog.toggle(this.getView().byId("idMessagePopoverButton"));
    },

    onTabSelect: function (oEvent) {
      var strKey = oEvent.getParameters().key;
      var oComponent = this.getOwnerComponent();
      var oTimecardModel = oComponent.getModel("timecard");

      oTimecardModel.setProperty("/footerToolbarVisible", (strKey === "reportWorkHours"))
    },

    onAddMinimumHours: function () {
      var oComponent = this.getOwnerComponent();
      var oModel = oComponent.getModel("settings");
      var oTimecardModel = oComponent.getModel("timecard");
      var nHoursMinimum = oModel.getProperty("/hoursMinimum");
      var strKey = oTimecardModel.getProperty("/currentMonth") 
        + "/" + oTimecardModel.getProperty("/currentYear");

      if (!nHoursMinimum[strKey]) {
        nHoursMinimum[strKey] = nHoursMinimum["default"];
      }
      
      nHoursMinimum[strKey] += 1;

      oModel.setProperty("/hoursMinimum", nHoursMinimum);
      oModel.setProperty("/hoursMinimumCurrent", nHoursMinimum[strKey]);

      storage.put(oModel);
    },

    onSubtractMinimumHours: function () {
      var oComponent = this.getOwnerComponent();
      var oModel = oComponent.getModel("settings");
      var oTimecardModel = oComponent.getModel("timecard");
      var nHoursMinimum = oModel.getProperty("/hoursMinimum");
      var strKey = oTimecardModel.getProperty("/currentMonth") 
        + "/" + oTimecardModel.getProperty("/currentYear");

      if (!nHoursMinimum[strKey]) {
        nHoursMinimum[strKey] = nHoursMinimum["default"];
      }
      
      nHoursMinimum[strKey] -= 1;

      oModel.setProperty("/hoursMinimum", nHoursMinimum);
      oModel.setProperty("/hoursMinimumCurrent", nHoursMinimum[strKey]);

      storage.put(oModel);
    },

    onCalendarChange: function (oEvent) {
      var oComponent = this.getOwnerComponent();
      var oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
      var oTimecardModel = oComponent.getModel("timecard");
      var oDate = oEvent.getSource().getStartDate();

      oTimecardModel.setProperty("/currentMonthDescription",
        oResourceBundle.getText("month" + oDate.getMonth()));
      oTimecardModel.setProperty("/currentMonth", oDate.getMonth() + 1);
      oTimecardModel.setProperty("/currentYear", oDate.getFullYear());

      this.refreshReportTableData();
    }
  });
});