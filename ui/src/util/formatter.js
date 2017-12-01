sap.ui.define([
    "sap/m/ValueColor"
], function(ValueColor) {
  return {
    formatHoursWorkedColor: function(nHoursMinimum, nHoursWorked) {
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