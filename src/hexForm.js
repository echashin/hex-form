/*global HexWidget:true,HexValidator:true */
'use strict';
this.hexForm = (function () {
  function Control(config) {
    var self = this;
    self.type = undefined;
    self.valid = true;
    self.name = undefined;
    var inputs = [];
    var form = config.form;

    var tab, errors, formGroup, timerId;
    self.tabPanel = undefined;

    var validators = [];
    var widgets = {};
    var events = {};


    var byProperty = function (prop) {
      return function (a, b) {
        if (typeof a[prop] === 'number') {
          return (a[prop] - b[prop]);
        } else {
          return ((a[prop] < b[prop]) ? -1 : ((a[prop] > b[prop]) ? 1 : 0));
        }
      };
    };

    var validateFunc = function () {
      var errorsCount = 0;
      errors.find('span').removeClass('active');
      for (var vIndex in validators) {
        if (validators.hasOwnProperty(vIndex)) {
          var validator = validators[vIndex];
          var value = self.getValue();
          var isValid = validator.isValid(value);
          if (isValid === false || isValid === 'false') {
            errorsCount++;
            errors.find('span.error-' + validator.getClassName()).addClass('active');
            break;
          }
        }
      }

      if (errorsCount > 0) {
        self.valid = false;
        formGroup.addClass('has-error');
      }
      else {
        formGroup.removeClass('has-error');
        self.valid = true;
      }

      if (tab !== undefined) {
        var controlsValid = true;
        for (var c in form.controls) {
          if (form.controls.hasOwnProperty(c)) {
            var otherControl = form.controls[c];
            if (otherControl.tabPanel === self.tabPanel && otherControl.valid === false) {
              controlsValid = false;
              break;
            }
          }
        }
        if (controlsValid === true) {
          tab.removeClass('has-error');
        } else {
          tab.addClass('has-error');
        }
      }

      return self.valid;
    };

    self.validate = function (event) {
      if (event !== undefined) {
        if (event.type === 'blur') {
          return validateFunc();
        } else {
          if (timerId !== undefined) {
            clearTimeout(timerId);
          }
          timerId = setTimeout(validateFunc, 500);
        }
      } else {
        return validateFunc();
      }
    };

    self.trigger = function (event) {
      for (var i = 0; i < inputs.length; i++) {
        inputs[i].trigger(event);
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

    var addValidator = function (vType, conf, input) {
      var vConfig = {
        'input': input,
        'type': vType
      };
      if (conf !== undefined && conf !== '') {
        $.extend(vConfig, jQuery.parseJSON(conf));
      }
      var validator = new HexValidator(vConfig);
      var validatorEvents = validator.getEvents();
      for (var eventName in validatorEvents) {
        if (validatorEvents.hasOwnProperty(eventName)) {
          events[validatorEvents[eventName]] = true;
        }
      }
      validators.push(validator);
    };
    var addWidget = function (wType, conf, input) {
      var widgetConfig = {
        'input': input,
        'type': wType
      };
      if (conf !== undefined && conf !== '') {
        $.extend(widgetConfig, jQuery.parseJSON(conf));
      }
      widgets[wType] = new HexWidget(widgetConfig);
    };

    self.addInput = function (input) {
      inputs.push(input);
      //Подключение валидаторов
      var attributes = getAttributes(input);
      for (var aName in attributes) {
        if (attributes.hasOwnProperty(aName)) {
          if (aName === 'required') {
            addValidator('required', attributes[aName], input);
          } else {
            var vMatch = aName.match(/^data-hex-validator-(.*)$/i);
            if (vMatch !== null && vMatch[1] !== undefined) {
              addValidator(vMatch[1], attributes[aName], input);
            }
          }

          var wMatch = aName.match(/^data-hex-widget-(.*)$/i);
          if (wMatch !== null) {
            if (wMatch[1] !== undefined) {
              addWidget(wMatch[1], attributes[aName], input);
            }
          }
        }
      }

      for (var eventName in events) {
        if (events.hasOwnProperty(eventName)) {
          input.bind(eventName, self.validate);
        }
      }
      validators.sort(byProperty('weight'));
    };

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
                value += picker.startDate.format('YYYY-MM-DD');
                if (picker.singleDatePicker === false) {
                  var endDate = picker.endDate.format('YYYY-MM-DD');
                  value += ' - ' + endDate;
                }
                return value;
              }

            }
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

    var init = function (conf) {
      if (conf.type !== undefined) {
        self.type = conf.type;
        if (conf.type === 'checkbox') {
          self.trueValue = true;
          self.falseValue = false;
        }
      }
      if (conf.form !== undefined) {
        form = conf.form;
      }
      self.name = conf.name;
      if (conf.inputs !== undefined) {
        for (var i in conf.inputs) {
          if (conf.inputs.hasOwnProperty(i)) {
            self.addInput(conf.inputs[i]);
          }
        }
      }
      formGroup = inputs[0].closest('div.form-group');
      errors = formGroup.find('.errors');
      self.tabPanel = inputs[0].closest('.tab-pane');
      if (self.tabPanel.size() > 0) {
        var tabId = self.tabPanel.attr('id');
        var tabEl = $('.nav a[href="#' + tabId + '"]');
        if (tabEl.size() > 0) {
          tab = tabEl;
        }
      }

    };
    init(config);
  }

  function HexFormSingle(f) {
    var self = this;
    self.controls = [];
    var form = f;
    var findControls = function () {
      $.each(form.find('input[type!="submit"],select,textarea'), function (i, field) {
        var input = $(field);
        var tagName = input.prop('tagName').toLowerCase();
        switch (tagName) {
          case 'textarea':
          {
            self.controls.push(new Control({type: 'textarea', inputs: [input], form: self, name: input.attr('name')}));
            break;
          }
          case 'select':
          {

            self.controls.push(new Control({type: 'select', inputs: [input], form: self, name: input.attr('name')}));
            break;
          }
          case 'input':
          {
            var type = input.attr('type').toLowerCase();
            switch (type) {
              default:
              {
                self.controls.push(new Control({type: type, inputs: [input], form: self, name: input.attr('name')}));
                break;
              }
              case 'checkbox':
              {
                var control = new Control({type: 'checkbox', inputs: [input], form: self, name: input.attr('name')});
                if (input.attr('value') !== undefined) {
                  control.trueValue = input.attr('value');
                }
                if (input.attr('data-hex-true-value') !== undefined) {
                  control.trueValue = input.attr('data-hex-true-value');
                }


                if (input.attr('data-hex-false-value') !== undefined) {
                  control.falseValue = input.attr('data-hex-false-value');
                }

                self.controls.push(control);
                break;
              }
              case 'radio':
              {
                if (self.controls[input.attr('name')] === undefined) {
                  self.controls[input.attr('name')] = new Control({
                    type: 'radio',
                    inputs: [input],
                    form: self,
                    name: input.attr('name')
                  });
                } else {
                  self.controls[input.attr('name')].addInput(input);
                }

                break;
              }
            }
            break;
          }
        }

      });
    };
    var getValues = function () {
      var values = {};
      for (var i in self.controls) {
        if (self.controls.hasOwnProperty(i)) {
          var name = self.controls[i].name;
          values[name] = self.controls[i].getValue();
        }
      }
      return values;
    };

    var reset = function () {
      window.setTimeout(function () {
        for (var i in self.controls) {
          if (self.controls.hasOwnProperty(i)) {
            self.controls[i].trigger('change');
          }
        }
      }, 1);
    };
    var clearErrors = function () {
      form.find('.has-error').removeClass('has-error');
      form.find('.alerts div').remove();
      form.find('.messages div').remove();
      form.find('.errors .active').removeClass('active');
    };

    var submit = function (event) {
      event.preventDefault();
      var valid = true;
      for (var i in self.controls) {
        if (self.controls.hasOwnProperty(i)) {
          if (self.controls[i].validate(undefined) === false) {
            valid = false;
          }
        }
      }
      if (valid === true) {
        var data = getValues();
        var url = form.attr('action');

        clearErrors();

        /*Отправка на разные URL аттрибут data-action*/
        var submitBtn = form.find('button[type=submit]:focus');
        if (submitBtn.size() > 0) {
          if (submitBtn.attr('data-action') !== undefined) {
            url = submitBtn.attr('data-action');
          }
        }
        $.ajax({
          url: url,
          data: data,
          type: 'POST',
          dataType: 'json',
          success: function (res) {
            if (res.success === true) {
              clearErrors();
              if (res.reload !== undefined) {
                if (res.reload === true) {
                  window.location.href = window.location.href;
                } else {
                  window.location.href = res.reload;
                }
              }
              if (res.alerts !== undefined) {
                for (var m in res.alerts) {
                  form.find('.messages').append($('<div>').html(res.alerts[m]));
                }
              }
            } else {
              if (res.alerts !== undefined) {
                for (var a in res.alerts) {
                  form.find('.alerts').append($('<div>').html(res.alerts[a]));
                }
              }
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
          }
        });
      }
      return false;
    };

    self.submit = function () {
      submit();
    };
    self.getValues = function () {
      return getValues();
    };
    var init = function () {
      form.addClass('loader-container').append('<div class="loader"></div>');
      form.bind('submit', submit);
      form.bind('reset', reset);
      findControls();
    };

    init();
    return self;
  }

  var hexForms = {};

  function hexFormInit(id) {
    if (id === undefined) {
      var forms = $('form.hex-form');
      forms.each(function () {
        var formId = $(this).attr('id');
        if (formId === undefined) {
          throw new Error('Form dont have id attr');
        }
        hexForms[formId] = new HexFormSingle($(this));
      });
    } else {
      return hexForms[id];
    }
    return hexForms;
  }


  return hexFormInit;
})();

