sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/m/MessageToast",
  "sap/m/Dialog",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "com/sap/dotproject/timecard/model/helpers"
], function (Controller, History, MessageToast, Dialog, Filter, FilterOperator, helpers) {
  "use strict";
  return Controller.extend("com.sap.dotproject.timecard.controller.Settings", {
    setInputCallback: null,

    onBack: function (oEvent) {
      var oComponent = this.getOwnerComponent();
      var oRouter = oComponent.getRouter();
      var oHistory = History.getInstance();
      var sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        oRouter.navTo("main", true);
      }
    },

    onSave: function (oEvent) {
      var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
      var oModel = this.getOwnerComponent().getModel("settings");

      oStorage.put("settings", oModel.getProperty("/"));

      this.onBack(oEvent);

      MessageToast.show("Settings saved to device storage", {
        duration: 2000
      });
    },

    onStatusAdd: function (oEvent) {
      var oView = this.getView();
      var oDialog = oView.byId("idAddStatusDialog");
      var oModel = this.getOwnerComponent().getModel("addStatusDialog");

      oModel.setProperty("/name", "");

      if (!oDialog) {
        oDialog = sap.ui.xmlfragment(oView.getId(), "com.sap.dotproject.timecard.view.AddStatusDialog", this);

        oView.addDependent(oDialog);
      }

      oDialog.open();
    },

    onAddStatusDialogCreate: function (oEvent) {
      var oSettingsModel = this.getOwnerComponent().getModel("settings");
      var oModel = this.getOwnerComponent().getModel("addStatusDialog");

      var oStatus = {
        statusId: 0,
        title: oModel.getProperty("/name"),
        company: "",
        companyId: "",
        project: "",
        projectId: "",
        task: "",
        taskId: "",
        description: ""
      };

      var arrStatuses = oSettingsModel.getProperty("/statuses");
      var nMaxStatusId = 0;

      if (arrStatuses.length > 0) {
        nMaxStatusId = Math.max.apply(null, arrStatuses.map(function (oStat) {
          return oStat.statusId;
        }));
      }

      oStatus.statusId = nMaxStatusId + 1;

      arrStatuses.push(oStatus);

      oSettingsModel.setProperty("/statuses", arrStatuses);
      oSettingsModel.setProperty("/defaultStatusId", arrStatuses[0].statusId);

      this.onAddStatusDialogClose(oEvent, true);
    },

    onAddStatusDialogClose: function (oEvent, bScrollDown) {
      var oView = this.getView();
      var oDialog = oView.byId("idAddStatusDialog");

      oDialog.close();

      if (bScrollDown === true) {
        var oTextLast = oView.byId("idTextLast");

        oView.byId("idPageSettings").scrollToElement(oTextLast);
      }
    },

    onDeleteStatus: function (oEvent) {
      var oSettingsModel = this.getOwnerComponent().getModel("settings");
      var strPath = oEvent.getParameters().listItem.getBindingContext("settings").getPath();
      var arrSplittedPath = strPath.split("/");
      var nIndex = parseInt(arrSplittedPath[arrSplittedPath.length - 1], 10);

      var arrStatuses = oSettingsModel.getProperty("/statuses");

      arrStatuses.splice(nIndex, 1);

      oSettingsModel.setProperty("/statuses", arrStatuses);
    },

    onCompanyValueHelp: function (oEvent) {
      var oSettingsModel = this.getOwnerComponent().getModel("settings");
      var oModel = this.getOwnerComponent().getModel("valueHelpDialog");
      var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
      var oSource = oEvent.getSource();

      oModel.setProperty("/title", oResourceBundle.getText("valueHelpDialogCompanyTitle"));
      oModel.setProperty("/noDataText", oResourceBundle.getText("valueHelpDialogCompanyNoDataText"));

      this.getView().setBusy(true);

      jQuery.ajax("/api/companies", {
        method: "POST",
        data: helpers.getApiPostData(oSettingsModel),
        success: function (oData) {
          this.getView().setBusy(false);

          oModel.setProperty("/items", oData);

          this.openValueHelpDialog(oSource, function(strValue, strValueId) {
            oSettingsModel.setProperty(oSource.getBindingContext("settings").getPath() + "/company", strValue);
            oSettingsModel.setProperty(oSource.getBindingContext("settings").getPath() + "/companyId", strValueId);
          });
        }.bind(this)
      });
    },

    onProjectValueHelp: function (oEvent) {
      var oSettingsModel = this.getOwnerComponent().getModel("settings");
      var oModel = this.getOwnerComponent().getModel("valueHelpDialog");
      var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
      var oSource = oEvent.getSource();
      var strCompany = oSettingsModel.getProperty(oSource.getBindingContext("settings").getPath() + "/company");

      oModel.setProperty("/title", oResourceBundle.getText("valueHelpDialogProjectTitle"));
      oModel.setProperty("/noDataText", oResourceBundle.getText("valueHelpDialogProjectNoDataText"));
      
      this.getView().setBusy(true);

      jQuery.ajax("/api/companies/" + strCompany + "/projects", {
        method: "POST",
        data: helpers.getApiPostData(oSettingsModel),
        success: function (oData) {
          this.getView().setBusy(false);

          oModel.setProperty("/items", oData);

          this.openValueHelpDialog(oSource, function(strValue, strValueId) {
            oSettingsModel.setProperty(oSource.getBindingContext("settings").getPath() + "/project", strValue);
            oSettingsModel.setProperty(oSource.getBindingContext("settings").getPath() + "/projectId", strValueId);
          });
        }.bind(this)
      });
    },

    onTaskValueHelp: function (oEvent) {
      var oSettingsModel = this.getOwnerComponent().getModel("settings");
      var oModel = this.getOwnerComponent().getModel("valueHelpDialog");
      var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
      var oSource = oEvent.getSource();
      var strCompany = oSettingsModel.getProperty(oSource.getBindingContext("settings").getPath() + "/company");
      var strProject = oSettingsModel.getProperty(oSource.getBindingContext("settings").getPath() + "/project");

      oModel.setProperty("/title", oResourceBundle.getText("valueHelpDialogTaskTitle"));
      oModel.setProperty("/noDataText", oResourceBundle.getText("valueHelpDialogTaskNoDataText"));
      
      this.getView().setBusy(true);

      jQuery.ajax("/api/companies/" + strCompany + "/projects/" + strProject + "/tasks", {
        method: "POST",
        data: helpers.getApiPostData(oSettingsModel),
        success: function (oData) {
          this.getView().setBusy(false);

          oModel.setProperty("/items", oData);

          this.openValueHelpDialog(oSource, function(strValue, strValueId) {
            oSettingsModel.setProperty(oSource.getBindingContext("settings").getPath() + "/task", strValue);
            oSettingsModel.setProperty(oSource.getBindingContext("settings").getPath() + "/taskId", strValueId);
          });
        }.bind(this)
      });
    },

    openValueHelpDialog: function (oSource, fnSetInputCallback) {
      var oView = this.getView();
      var oDialog = oView.byId("idValueHelpDialog");

      this.setInputCallback = fnSetInputCallback;

      if (!oDialog) {
        oDialog = sap.ui.xmlfragment(oView.getId(), "com.sap.dotproject.timecard.view.ValueHelpDialog", this);

        oView.addDependent(oDialog);
      }

      oDialog.open();
      oDialog.getBinding("items").filter([]);
    },

    handleValueHelpDialogSearch: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilter = new Filter("text", FilterOperator.Contains, sValue);

      oEvent.getSource().getBinding("items").filter([oFilter]);
    },

    handleValueHelpDialogClose: function (oEvent) {
      var oSelectedItem = oEvent.getParameter("selectedItem");

      if (oSelectedItem) {
        this.setInputCallback(oSelectedItem.getTitle(), oSelectedItem.getCustomData()[0].getValue());
      }

      oEvent.getSource().getBinding("items").filter([]);
    }
  });
});