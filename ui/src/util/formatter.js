sap.ui.define([
  "sap/m/ValueColor"
], function (ValueColor) {
  return {
    formatHoursWorkedColor: function (arrHoursMinimum, nHoursWorked) {
      var oTimecardModel = this.getOwnerComponent().getModel("timecard")
      var strKey = oTimecardModel.getProperty("/currentMonth") + "/" + oTimecardModel.getProperty("/currentYear"); 
      var nHoursMinimum = arrHoursMinimum[strKey] || arrHoursMinimum["default"];
      var nPercent = nHoursMinimum / 100.0;

      if (nHoursWorked <= nPercent * 30) {
        return ValueColor.Error;
      } else if (nHoursWorked <= nPercent * 70) {
        return ValueColor.Critical;
      } else {
        return ValueColor.Good;
      }
    }
  };
});