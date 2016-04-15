var hex = (function (h) {
  'use strict';
  h.widgets.mask = function (control, config) {
    var input, mask;

    function init() {
      input = control.getInputs()[0];
      if (config.mask !== undefined) {
        mask = config.mask;
      } else {
        throw new Error(input.attr('name') + ' doesn`t set mask param');
      }
      input.inputmask(mask);
    }

    init();
  };

  return h;
}(hex));
