sap.ui.define([
  'jquery.sap.global',
  'sap/m/MaskInput',
  "sap/m/InputType"
],
  function (
    jQuery,
    MaskInput,
    InputType
  ) {
    "use strict";

    var CMaskInput = MaskInput.extend("com.ui5.dotproject.timecard.control.CMaskInput", {
      metadata: {

        properties: {
          /**
           * HTML type of the internal <code>input</code> tag (e.g. Text, Number, Email, Phone).
           * The particular effect of this property differs depending on the browser and the current language settings,
           * especially for the type Number.<br>
           * This parameter is intended to be used with touch devices that use different soft keyboard layouts depending on the given input type.<br>
           * Only the default value <code>sap.m.InputType.Text</code> may be used in combination with data model formats.
           * <code>sap.ui.model</code> defines extended formats that are mostly incompatible with normal HTML
           * representations for numbers and dates.
           */
          type: { type: "sap.m.InputType", group: "Data", defaultValue: InputType.Text },
          pattern: { type: "string", group: "Data", defaultValue: "" },
        }

      },

      renderer: {
        writeInnerAttributes: function (oRm, oControl) {
          oRm.writeAttribute("type", oControl.getType().toLowerCase());
          //if Input is of type "Number" step attribute should be "any" allowing input of floating point numbers
          if (oControl.getType() == InputType.Number) {
            oRm.writeAttribute("step", "any");
          }
          if (oControl.getType() == InputType.Number && sap.ui.getCore().getConfiguration().getRTL()) {
            oRm.writeAttribute("dir", "ltr");
            oRm.addStyle("text-align", "right");
          }
          if (oControl.getType() == InputType.Tel) {
            oRm.writeAttribute("pattern", oControl.getPattern());
          }
        }
      }
    });

    return CMaskInput;

  }, /* bExport= */ true);