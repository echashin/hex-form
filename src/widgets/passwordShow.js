var hex = (function (h) {
  'use strict';
  h.widgets.passwordShow = function (control) {
    var button, input;
    var currentType = 'password';

    function init() {
      input = control.getInputs()[0];
      button = input.closest('.form-group').find('button.password-show');
      button.bind('click', function (event) {
        event.preventDefault();
        if (currentType === 'password') {
          input.attr('type', 'text');
          button.addClass('active');
          currentType = 'text';
        } else {
          input.attr('type', 'password');
          button.removeClass('active');
          currentType = 'password';
        }
        input.focus();
        return false;
      });
    }

    init();
  };

  return h;
}(hex));
