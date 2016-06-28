var hex = (function (h) {
  'use strict';
  h.validators.required = function (control, config) {
    var self = this;
    var events = ['keyup', 'blur', 'change'];
    self.weight = 0;
    var name = 'required';

    self.getClassName = function () {
      return name;
    };
    self.setEvents = function (val) {
      events = val;
    };

    self.getEvents = function () {
      return events;
    };

    function init() {
      if (config.events !== undefined) {
        self.setEvents(config.events);
      }
    }

    self.isValid = function (value) {
      return !h.utils.isEmpty(value);
    };
    if (config !== undefined) {
      init();
    }
  };

  return h;
}(hex));
