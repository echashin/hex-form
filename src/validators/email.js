var hex = (function (h) {
  'use strict';
  h.validators.email = function (control, config) {
    var self = this;
    var className = 'email';
    self.getClassName = function () {
      return className;
    };
    var events = ['change', 'keyup'];
    var emailPattern = /^\S+[@]\S+\.\S{2,10}$/i;
    self.weight = 1;
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
    }
    self.isValid = function (value) {
      if (h.utils.isEmpty(value)) {
        return true;
      }
      return emailPattern.test(value);
    };
    init();
  };

  return h;
}(hex));
