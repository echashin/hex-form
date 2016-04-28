var hex = (function (h) {
  'use strict';
  h.Control = function (config) {
    var self = this;
    self.type = undefined;
    self.valid = true;
    self.name = undefined;
    var inputs = [];
    self.block = undefined;
    var errorsBlock;
    var errors = [];

    var defaultValue;
    self.formGroup = undefined;

    var validators = [];
    var widgets = {};
    var events = {};
    var controlValue;
    self.disabled = false;
    self.readonly = false;

    self.hideErrors = function () {
      errors = [];
      if (self.formGroup !== undefined) {
        self.formGroup.removeClass('has-error');
      }
      if (errorsBlock !== undefined) {
        errorsBlock.find('span').removeClass('active');
      }
    };

    self.showErrors = function () {
      if (errorsBlock !== undefined) {
        for (var e in errors) {
          errorsBlock.find('span.error-' + errors[e]).addClass('active');
        }
      }
      if (self.formGroup !== undefined) {
        self.formGroup.addClass('has-error');
      }
    };

    self.reset = function () {
      //self.setValue(defaultValue);
      self.trigger('change');
      self.hideErrors();
    };


    self.getWidgets = function () {
      return widgets;
    };

    self.getInputs = function () {
      return inputs;
    };

    self.enable = function () {
      for (var inp in inputs) {
        inputs[inp].prop('disabled', false);
      }
      self.disabled = false;
    };

    self.disable = function () {
      for (var inp in inputs) {
        inputs[inp].prop('disabled', true);
      }
      self.disabled = true;
      self.valid = true;
    };

    self.addReadonly = function () {
      for (var inp in inputs) {
        inputs[inp].prop('readonly', true);
      }
      self.readonly = true;
    };

    self.removeReadonly = function () {
      for (var inp in inputs) {
        inputs[inp].prop('readonly', false);
      }
      self.readonly = false;
    };

    function sortByProperty(prop) {
      return function (a, b) {
        if (typeof a[prop] === 'number') {
          return (a[prop] - b[prop]);
        } else {
          return ((a[prop] < b[prop]) ? -1 : ((a[prop] > b[prop]) ? 1 : 0));
        }
      };
    }

    var validateFunc = function (update) {
      if (update === false) {
        return self.valid;
      }
      self.hideErrors();
      if (!self.disabled) {
        for (var v in validators) {
          if (validators.hasOwnProperty(v)) {
            var validator = validators[v];
            var isValid = validator.isValid(self.getValue());
            if (isValid === false || isValid === 'false') {
              errors.push(validator.getClassName());
              break;
            }
          }
        }
      }
      if (errors.length > 0) {
        self.valid = false;
        self.showErrors();
      }
      else {
        self.valid = true;
        self.hideErrors();
      }
      self.block.form.mainBlock.isValid(false);
      return self.valid;
    };

    self.isValid = function (update) {
      return validateFunc(update);
    };


    self.trigger = function (event) {
      for (var i = 0; i < inputs.length; i++) {
        inputs[i].trigger(event);
      }
    };

    self.addEvent = function (eventName, func) {
      for (var i = 0; i < inputs.length; i++) {
        inputs[i].bind(eventName, func);
      }
    };

    var getAttributes = function (input) {
      var map = {};
      var attributes = input[0].attributes;
      var aLength = attributes.length;
      for (var a = 0; a < aLength; a++) {
        map[attributes[a].name.toLowerCase()] = attributes[a].value;
      }
      return map;
    };

    var addValidator = function (vType, conf) {
      var vConfig = {};
      vType = h.utils.toCamel(vType);
      if (conf !== undefined && conf !== '') {
        $.extend(vConfig, jQuery.parseJSON(conf));
      }
      if (h.validators[vType] !== undefined) {
        var validator = new h.validators[vType](self, vConfig);
        var validatorEvents = validator.getEvents();
        for (var eventName in validatorEvents) {
          if (validatorEvents.hasOwnProperty(eventName)) {
            events[validatorEvents[eventName]] = true;
          }
        }
        validators.push(validator);
      } else {
        console.warn('Validator "' + vType + '" not loaded!');
      }
    };

    var addWidget = function (wType, conf) {
      wType = h.utils.toCamel(wType);
      var widgetConfig = {};
      if (conf !== undefined && conf !== '') {
        $.extend(widgetConfig, jQuery.parseJSON(conf));
      }
      if (h.widgets[wType] !== undefined) {
        widgets[wType] = new h.widgets[wType](self, widgetConfig);
      } else {
        console.warn('Widget "' + wType + '" not loaded!');
      }
    };

    function addInput(input) {
      inputs.push(input);
      //Подключение валидаторов и виджетов
      var attributes = getAttributes(input);
      for (var aName in attributes) {
        if (attributes.hasOwnProperty(aName)) {
          var wMatch = aName.match(/^data-hex-widget-(.*)$/i);
          if (wMatch !== null) {
            if (wMatch[1] !== undefined) {
              addWidget(wMatch[1], attributes[aName]);
            }
          }

          if (aName === 'required') {
            addValidator('required', attributes[aName]);
          } else {
            var vMatch = aName.match(/^data-hex-validator-(.*)$/i);
            if (vMatch !== null && vMatch[1] !== undefined) {
              addValidator(vMatch[1], attributes[aName]);
            }
          }
        }
      }

      for (var eventName in events) {
        if (events.hasOwnProperty(eventName)) {
          input.bind(eventName, validateFunc);
        }
      }
      validators.sort(sortByProperty('weight'));
      if (input.prop('disabled')) {
        self.disable();
      }
      if (input.prop('readonly')) {
        self.addReadonly();
      }

      input.bind('disable', function () {
        self.disable();
      });
      input.bind('enable', function () {
        self.enable();
      });
      defaultValue = self.getValue();
    }

    self.getValue = function () {
      switch (self.type) {
        case 'text':
        default:
        {
          if (widgets.date !== undefined) {
            var picker = inputs[0].data('daterangepicker');
            if (picker === undefined) {
              return inputs[0].val();
            } else {
              if (inputs[0].val() === '') {
                return false;
              } else {
                var value = '';
                var format = 'YYYY-MM-DD';
                if (picker.timePicker === true) {
                  format += ' HH:mm';
                }
                value += picker.startDate.format(format);
                if (picker.singleDatePicker === false) {
                  var endDate = picker.endDate.format(format);
                  value += ' - ' + endDate;
                }
                return value;
              }

            }
          } else if (widgets.fileupload !== undefined || widgets.filesimple !== undefined) {
            return controlValue;
          } else {
            return inputs[0].val();
          }
        }
        case 'radio':
        {
          for (var i in inputs) {
            if (inputs.hasOwnProperty(i)) {
              if (inputs[i].is(':checked') === true) {
                return inputs[i].val();
              }
            }
          }
          return false;
        }
        case 'checkbox':
        {
          if (inputs[0].is(':checked') === true) {
            return self.trueValue;
          } else {
            return self.falseValue;
          }
        }
      }
    };


    self.setValue = function (val) {
      controlValue = val;
    };


    var initControl = function (conf) {

      if (conf.type !== undefined) {
        self.type = conf.type;
        if (conf.type === 'checkbox') {
          self.trueValue = true;
          self.falseValue = false;
          if (conf.trueValue !== undefined) {
            self.trueValue = conf.trueValue;
          }
          if (conf.falseValue !== undefined) {
            self.falseValue = conf.falseValue;
          }
        }
      }
      if (conf.block !== undefined) {
        self.block = conf.block;
      }
      self.name = conf.name;
      self.formGroup = conf.formGroup;
      errorsBlock = conf.errorsBlock;
      if (conf.inputs !== undefined) {
        for (var i in conf.inputs) {
          if (conf.inputs.hasOwnProperty(i)) {
            addInput(conf.inputs[i]);
          }
        }
      }
      self.hideErrors();
    };
    initControl(config);
  };
  return h;
}(hex));

