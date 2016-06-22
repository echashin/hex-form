var hex = (function (h) {
  'use strict';
  h.widgets.filesimple = function (control) {
    var input;
    function prepareUpload(event) {
      control.setValue(event.target.files[0]);
    }

    function init() {
      input = control.getInputs()[0];
      input.bind('change', prepareUpload);
    }

    init();
  };

  return h;
}(hex));
