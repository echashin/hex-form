var hex = (function (h) {
  'use strict';
  h.validators.numSize = function (control, config) {
    var self = this;
    var min, max;
    //Округление при валидации
    var round = true;
    var className = 'num-size';
    self.getClassName = function () {
      return className;
    };
    var events = ['blur'];
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
      if (config.round !== undefined) {
        round = config.round;
      }
      if (config.events !== undefined) {
        self.setEvents(config.events);
      }
    }

    self.isValid = function (num) {
      num = parseInt(num);
      if (isNaN(num)) {
        num = '';
        if (round) {
          control.setValue('');
          return true;
        }

      }

      if (min !== undefined) {
        if (num < min) {
          className = 'num-size-min';
          if (round) {
            control.setValue(min);
            return true;
          }
          return false;
        }
      }
      if (max !== undefined) {
        if (num > max) {
          className = 'num-size-max';
          if (round) {
            control.setValue(max);
            return true;
          }
          return false;
        }
      }
      return true;
    };
    init();
  };

  return h;
}(hex));
