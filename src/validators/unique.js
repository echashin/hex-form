var hex = (function (h) {
  'use strict';
  h.validators.unique = function (control, config) {
    var self = this;
    var className = 'unique';
    self.getClassName = function () {
      return className;
    };

    var lastValidValue = false;
    var valid = false;
    var url;
    var ajax = false;
    var events = ['blur', 'change'];
    self.weight = 5;
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
      if (config.url !== undefined) {
        url = config.url;
      }
    }

    self.isValid = function (value) {
      if (ajax !== false) {
        ajax.abort();
      }
      if (h.utils.isEmpty(value)) {
        valid = true;
      }

      ajax = $.ajax({
        'url': url,
        'data': {'value': value},
        'method': 'POST',
        'async': true,
        'success': function (data) {
          if (data.success !== true) {
            valid = true;
          } else {
            valid = false;
          }
          control.validate(true);
        }
      });
      return valid;
    };
    init();
  };

  return h;
}(hex));
