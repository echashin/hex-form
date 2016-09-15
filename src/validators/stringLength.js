var hex = (function (h) {
  'use strict';
  h.validators.stringLength = function (control, config) {
    var self = this;
    var min, max;
    var className = 'string-length';
    self.getClassName = function () {
      return className;
    };
    var events = ['change', 'blur'];
    self.weight = 3;
    self.setEvents = function (e) {
      events = e;
    };

    self.getEvents = function () {
      return events;
    };

    function init() {
      if (config.min !== undefined) {
        min = config.min;
      }
      if (config.max !== undefined) {
        max = config.max;
      }
      if (config.events !== undefined) {
        self.setEvents(config.events);
      }
    }

    self.isValid = function (string) {
      var strLen = string.length;

      if (h.utils.isEmpty(string)) {
        return true;
      }

      if (min !== undefined) {
        if (strLen < min) {
          className = 'string-length-min';
          return false;
        }
      }
      if (max !== undefined) {
        if (strLen > max) {
          className = 'string-length-max';
          return false;
        }
      }
      return true;
    };
    init();
  };

  return h;
}(hex));
