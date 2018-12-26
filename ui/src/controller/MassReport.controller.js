sap.ui.define([
  "sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
  "sap/ui/core/format/DateFormat",
  "sap/ui/core/message/ControlMessageProcessor",
  "sap/ui/core/message/Message",
  "sap/ui/core/MessageType",
  "com/ui5/dotproject/timecard/model/helpers"
], function (
  Controller,
  History,
  DateFormat,
  ControlMessageProcessor,
  Message,
  MessageType,
  helpers
) {
  "use strict";

  return Controller.extend("com.ui5.dotproject.timecard.controller.MassReport", {
    onInit: function() {
      var oRouter = this.getOwnerComponent().getRouter();
      
			oRouter.getRoute("massreport").attachPatternMatched(this.onPatternMatched, this);
    },

    onPatternMatched: function (oEvent) {
      var oComponent = this.getOwnerComponent();
      var oTimecardModel = oComponent.getModel("timecard");
      var oMassReportModel = oComponent.getModel("massreport");
      var aReportHours = [];
      var aHoursReported = oTimecardModel.getProperty("/hoursReported");
      var nYear = parseInt(oTimecardModel.getProperty("/currentYear"), 10);
      var nMonth = parseInt(oTimecardModel.getProperty("/currentMonth"), 10) - 1;
      var dFirstDay = new Date(nYear, nMonth, 1);
      var dLastDay = new Date(nYear, nMonth + 1, 0);
      var oDateFormatter = DateFormat.getDateInstance({
        pattern: "dd/MM/yyyy"
      });
      var nNumOfDayInWeek = 0, dCurrDate, oFoundReport, sDate;

      var dCurrDate = new Date(dFirstDay.getTime());

      while (true) {
        nNumOfDayInWeek = dCurrDate.getDay();

        // Work day
        if (nNumOfDayInWeek >= 0 && nNumOfDayInWeek <= 4) {
          sDate = oDateFormatter.format(dCurrDate);

          oFoundReport = null;
          oFoundReport = aHoursReported.find(function (oReport) { 
            return oReport.date === sDate;
          });

          aReportHours.push({
            status: oFoundReport ? oFoundReport.statusId : 0,
            date: sDate,
            timeBegin: oFoundReport ? oFoundReport.timeBegin : "",
            timeEnd: oFoundReport ? oFoundReport.timeEnd : "",
            editable: !oFoundReport
          });
        }

        if (dCurrDate.getTime() === dLastDay.getTime()) {
          break;
        }

        dCurrDate.setDate(dCurrDate.getDate() + 1);
      }

      oMassReportModel.setProperty("/reportHours", aReportHours);
		},

    onBack: function () {
      var oHistory, sPreviousHash;

			oHistory = History.getInstance();
      sPreviousHash = oHistory.getPreviousHash();
      
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
        var oRouter = this.getOwnerComponent().getRouter();

				oRouter.navTo("main", {}, true /*no history*/);
			}
    },

    validateInput: function () {
      return helpers.reportValidateInput(this);
    },

    onSend: function () {
      var oComponent = this.getOwnerComponent();
      var oMassReportModel = oComponent.getModel("massreport");
      var aReportHours = oMassReportModel.getProperty("/reportHours");
      var bError = false;
      var oSettingsModel, oResourceBundle, arrStatuses,
        oMessageManager, oMessageProcessor, oSettingsModelRO;
      var aAjaxRequests = [];

      bError = aReportHours.every(function(oReportHour) {
        oReportHour.status = parseInt(oReportHour.status);

        return helpers.massReportValidateInput(this, oReportHour)
      }.bind(this)) === false;

      if (bError === true) {
        return;
      }

      oSettingsModel = oComponent.getModel("settings");
      oSettingsModelRO = oComponent.getModel("settingsReadOnly");
      oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
      arrStatuses = oSettingsModelRO.getProperty("/statuses");
      oMessageManager = sap.ui.getCore().getMessageManager();
      oMessageProcessor = new ControlMessageProcessor();

      var requestNext = function () {
        if (aAjaxRequests.length) {
          jQuery.ajax(aAjaxRequests.shift());
        } else {
          this.getView().setBusy(false);
          this.onBack();
        }
      };

      var ajaxSuccess = function () {
        oMessageManager.addMessages(new Message({
          message: oResourceBundle.getText("reportSuccessMessage"),
          type: MessageType.Success,
          processor: oMessageProcessor
        }));

        requestNext.apply(this, []);
      };

      var ajaxError = function (oError) {
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

        requestNext.apply(this, []);
      }

      aReportHours.forEach(function(oReportHour) {
        if(oReportHour.editable === false ||
            ( oReportHour.status === 0
             && oReportHour.timeBegin === ""
             && oReportHour.timeEnd === "")) {
          return;
        }

        var oStatus = arrStatuses.filter(function (oArrayStatus) {
          return oArrayStatus.statusId === parseInt(oReportHour.status, 10);
        })[0];
  
        var oFormData = {
          date: oReportHour.date,
          timeBegin: oReportHour.timeBegin,
          timeEnd: oReportHour.timeEnd,
          taskId: oStatus.taskId,
          description: oStatus.description
        };
  
        oFormData = jQuery.extend(true, oFormData, helpers.getApiPostData(oSettingsModel));

        aAjaxRequests.push({
          url:'/api/timecard', 
          data: oFormData, 
          success: ajaxSuccess.bind(this),
          error: ajaxError.bind(this)
        });
      }.bind(this));

      this.getView().setBusy(true);

      requestNext.apply(this, []);
    },

    onMessagePopover: function (oEvent) {
      var oView = this.getView();
      var oDialog = oView.byId("idMessagePopover");

      if (!oDialog) {
        oDialog = sap.ui.xmlfragment(oView.getId(), "com.ui5.dotproject.timecard.view.MessagePopover", this);

        oView.addDependent(oDialog);
      }

			// toggle compact style
			jQuery.sap.syncStyleClass(this.getOwnerComponent().getContentDensityClass(), this.getView(), oDialog);
      oDialog.toggle(this.getView().byId("idMessagePopoverButton"));
    }
  });
});