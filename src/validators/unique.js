var hex = (function (h) {
  'use strict';
  h.validators.unique = function (control, config) {
    var self = this;
    var className = 'unique';
    self.getClassName = function () {
      return className;
    };

    var lastValidValue = false;
    var url;
    var ajax = false;
    var events = ['change', 'keyup', 'blur'];
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
      if (lastValidValue !== value) {
        ajax = $.ajax({
          'url': url,
          'data': {'value': value},
          'method': 'POST',
          'async': false
        });
        var result = ajax.responseText;
        if (result === 'true') {
          lastValidValue = value;
        } else {
          lastValidValue = false;
        }
        return result;
      } else {
        return true;
      }
    };
    init();
  };

  return h;
}(hex));