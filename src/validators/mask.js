/* global Inputmask:true*/
var hex = (function (h) {
  'use strict';
  h.validators.mask = function (control, config) {
    var self = this;
    var input;
    var className = 'mask';
    var events = ['blur'];

    self.getClassName = function () {
      return className;
    };
    self.weight = 4;
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
