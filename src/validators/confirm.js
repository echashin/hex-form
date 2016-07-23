var hex = (function (h) {
  'use strict';
  h.validators.passwordConfirm = h.validators.confirm = function (control, config) {
    var self = this;
    var className = 'password-confirm';
    self.getClassName = function () {
      return className;
    };
    var events = ['change', 'blur'];
    self.weight = 4;
    var password;
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
      if (config.password !== undefined) {
        password = $(config.password);
      }
    }

    self.isValid = function (value) {
      return password.val() === value;
    };
    init();
  };

  return h;
}(hex));
