var hex = (function (h) {
  'use strict';
  h.widgets.passwordStrength = function (control) {
    var self = this;
    var input, passMeter;
    var characters = 0;
    var capitalletters = 0;
    var loweletters = 0;
    var number = 0;
    var special = 0;
    var upperCase = new RegExp('[A-ZА-Я]');
    var lowerCase = new RegExp('[a-zа-я]');
    var numbers = new RegExp('[0-9]');
    var specialchars = new RegExp('([!,%,&,@,#,$,^,*,?,_,~])');

    function checkStrength(value) {
      if (value.length > 8) {
        characters = 1;
      } else {
        characters = 0;
      }

      if (value.match(upperCase)) {
        capitalletters = 1;
      } else {
        capitalletters = 0;
      }

      if (value.match(lowerCase)) {
        loweletters = 1;
      } else {
        loweletters = 0;
      }

      if (value.match(numbers)) {
        number = 1;
      } else {
        number = 0;
      }

      if (value.match(specialchars)) {
        special = 1;
      } else {
        special = 0;
      }
      return characters + capitalletters + loweletters + number + special;
    }

    self.weight = 0;


    function init() {
      input = control.getInputs()[0];
      passMeter = input.closest('.form-group').find('.password-strength div');
      input.bind('keyup change', function () {
        var value = input.val();
        passMeter.attr('class', 's-' + checkStrength(value));
      });
    }

    init();
  };

  return h;
}(hex));
