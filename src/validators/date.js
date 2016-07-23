/* global Inputmask:true*/
var hex = (function (h) {
  'use strict';
  h.validators.date = function (control, config) {
    var self = this;
    var events = ['change', 'blur'];
    self.weight = 3;
    var input;
    var className = 'date';

    self.getClassName = function () {
      return className;
    };

    self.setEvents = function (e) {
      events = e;
    };

    self.getEvents = function () {
      return events;
    };

    function init() {
      if (config.events !== undefined) {
        self.setEvents(config.events);
      }
      input = control.getInputs()[0];
    }

    self.isValid = function (value) {
      if (h.utils.isEmpty(value)) {
        return true;
      }
      var mask = input.inputmask('option', 'mask');
      return Inputmask.isValid(input.val(), {alias: mask});
    };
    init();
  };

  return h;
}(hex));
