var hex = (function (h) {
  'use strict';
  h.widgets.phone = function (control, config) {
    var input;
    var mask = '+7(999)999-99-99';

    function init() {
      input = control.getInputs()[0];
      if (config.mask !== undefined) {
        mask = config.mask;
      }
      input.inputmask(mask);
    }

    init();
  };

  return h;
}(hex));
