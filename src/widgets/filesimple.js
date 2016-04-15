var hex = (function (h) {
  'use strict';
  h.widgets.filesimple = function (control) {
    var input, files;
    function init() {
      function prepareUpload(event) {
        files = event.target.files[0];
        control.setValue(files);
      }

      input = control.getInputs()[0];
      input.bind('change', prepareUpload);
    }
    init();
  };

  return h;
}(hex));
