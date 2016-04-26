var hex = (function (h) {
  'use strict';
  h.validators.fileupload = function (control, config) {
    var self = this;
    var className = 'fileupload';
    self.getClassName = function () {
      return className;
    };
    var events = [];
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

    self.isValid = function () {
      var widget = control.getWidgets().fileupload;
      if (widget === undefined) {
        return true;
      }
      if (widget.loading === true) {
        return false;
      }
      return true;
    };
    init();
  };

  return h;
}(hex));
