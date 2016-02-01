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
    self.tabPanelId = undefined;

    var validators = [];
    var widgets = {};
    var events = {};
    var controlValue;

    self.setValid = function () {
      formGroup.removeClass('has-error');
      errors.find('span').removeClass('active');
    };

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
            if (otherControl.tabPanelId === self.tabPanelId && otherControl.valid === false) {
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
        'type': wType,
        'control': self
      };
      if (conf !== undefined && conf !== '') {
        $.extend(widgetConfig, jQuery.parseJSON(conf));
      }
      widgets[wType] = new HexWidget(widgetConfig);
    };

    self.addInput = function (input) {
      inputs.push(input);
      //Подключение валидаторов и виджетов
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
          } else if (widgets.fileupload !== undefined) {
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
      var tabPanel = formGroup.closest('.tab-pane');
      if (tabPanel.size() > 0) {
        var tabId = tabPanel.attr('id');
        var tabEl = $('.nav a[href="#' + tabId + '"]');
        if (tabEl.size() > 0) {
          tab = tabEl;
        }
        self.tabPanelId = tabId;
      }
      self.setValid();
    };
    initControl(config);
  }

  function HexFormSingle(f) {
    var self = this;
    self.controls = {};

    var form = f;

    var handlers = {};

    var FormEvent = function (type) {
      this.type = type;
      this.stoped = false;
      this.stop = function () {
        this.stoped = true;
      };
    };

    self.on = function (eventName, fn) {
      if (handlers[eventName] === undefined) {
        handlers[eventName] = [];
      }
      handlers[eventName].push(fn);
    };

    self.off = function (eventName, fn) {
      if (handlers[eventName] !== undefined) {
        handlers[eventName].splice(handlers[eventName].indexOf(fn), 1);
      }
    };

    self.fire = function (eventName, params) {
      var formEvent = new FormEvent(eventName);
      if (handlers[eventName] !== undefined) {
        for (var fnIndex in handlers[eventName]) {
          var func = handlers[eventName][fnIndex];
          func(params, formEvent);
        }
      }
      return !formEvent.stoped;
    };

    var removeControls = function (container) {

      $.each(container.find('input[type!="submit"],select,textarea'), function (i, field) {
        var input = $(field);
        var controlName = input.attr('name');
        if (self.controls[controlName] !== undefined) {
          delete self.controls[controlName];
        }
      });
    };

    var addControls = function (container) {
      $.each(container.find('input[type!="submit"],select,textarea'), function (i, field) {
        var input = $(field);
        var controlName = input.attr('name');
        var tagName = input.prop('tagName').toLowerCase();
        switch (tagName) {
          case 'select':
          case 'textarea':
          {
            self.controls[controlName] = new Control({type: tagName, inputs: [input], form: self, name: controlName});
            break;
          }
          case 'input':
          {
            var type = input.attr('type').toLowerCase();
            switch (type) {
              default:
              {
                self.controls[controlName] = new Control({type: type, inputs: [input], form: self, name: controlName});
                break;
              }
              case 'checkbox':
              {
                var checkboxControl = new Control({type: 'checkbox', inputs: [input], form: self, name: controlName});
                if (input.attr('value') !== undefined) {
                  checkboxControl.trueValue = input.attr('value');
                }
                if (input.attr('data-hex-true-value') !== undefined) {
                  checkboxControl.trueValue = input.attr('data-hex-true-value');
                }

                if (input.attr('data-hex-false-value') !== undefined) {
                  checkboxControl.falseValue = input.attr('data-hex-false-value');
                }

                self.controls[controlName] = checkboxControl;
                break;
              }
              case 'radio':
              {
                if (self.controls[controlName] === undefined) {
                  self.controls[controlName] = new Control({
                    type: 'radio',
                    inputs: [input],
                    form: self,
                    name: controlName
                  });
                } else {
                  self.controls[controlName].addInput(input);
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


    var reset = function (event) {
      var dontBreakReset = self.fire('beforeReset', {values: self.getValues()});
      if (dontBreakReset) {
        window.setTimeout(function () {
          for (var i in self.controls) {
            if (self.controls.hasOwnProperty(i)) {
              self.controls[i].trigger('change');
            }
          }
        }, 1);
      } else {
        event.preventDefault();
      }
      self.fire('afterReset', {});
    };
    var clearErrors = function () {
      form.find('.has-error').removeClass('has-error');
      form.find('.alerts div').remove();
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
        clearErrors();
        var data = getValues();
        var dontBreakBefore = self.fire('beforeSubmit', {values: data});
        if (dontBreakBefore) {
          self.loaderShow();
          var url = form.attr('action');
          /*Отправка на разные URL аттрибут data-action*/
          var submitBtn = form.find('button[type=submit]:focus');
          if (submitBtn.size() > 0) {
            if (submitBtn.attr('data-action') !== undefined) {
              url = submitBtn.attr('data-action');
            }
          }
          var method = 'POST';

          if (form.attr('method') !== undefined) {
            method = form.attr('method');
          }

          $.ajax({
            url: url,
            data: data,
            type: method,
            dataType: 'json',
            success: function (res) {
              self.loaderHide();
              if (res.success === true) {
                clearErrors();
                if (res.reload !== undefined) {
                  if (res.reload === true) {
                    window.location.href = window.location.href;
                  } else {
                    window.location.href = res.reload;
                  }
                }
              }
              if (res.alerts !== undefined) {
                for (var m in res.alerts) {
                  var message = res.alerts[m];
                  form.find('.alerts').append($('<div>').addClass('alert alert-' + message.type).html(message.text));
                }
              }
            },
            error: function (jqXHR, textStatus, errorThrown) {
              self.loaderHide();
            }
          });
        }
      }
      return false;
    };

    self.loaderShow = function () {
      form.find('.loader').show();
    };
    self.loaderHide = function () {
      form.find('.loader').hide();
    };

    self.submit = function () {
      submit();
    };
    self.getValues = function () {
      return getValues();
    };

    function updateItemIndex(item, newIndex) {
      item.attr('data-hex-multy-item', newIndex);
      item.find('input[type!="submit"],select,textarea').each(function () {
        $(this).val('');
        var name = $(this).attr('name');
        name = name.replace(/\[\d+\]/g, function (n) {
          return '[' + newIndex + ']';
        });
        $(this).attr('name', name);
      });
    }

    var init = function () {
      form.addClass('loader-container').append('<div class="loader"></div>');
      form.bind('submit', submit);
      form.bind('reset', reset);
      if (form.find('.loader').size() === 0) {
        form.append('<div class="loader"></div>');
      }
      addControls(form);

      form.find('div[data-hex-multy]').on('click', 'button[data-hex-multy-add]', function () {
        var multy = $(this).closest('div[data-hex-multy]');
        var lastFieldSet = multy.find('[data-hex-multy-item]').last();
        var index = parseInt(lastFieldSet.attr('data-hex-multy-item'));
        var items = $(this).closest('[data-hex-multy]').find('[data-hex-multy-item]');
        var newIndex = items.size();
        var clonedFieldset = lastFieldSet.clone(false);
        updateItemIndex(clonedFieldset, newIndex);
        addControls(clonedFieldset);
        clonedFieldset.insertAfter(lastFieldSet);
      });

      form.find('div[data-hex-multy]').on('click', 'button[data-hex-multy-remove]', function () {
        var item = $(this).closest('[data-hex-multy-item]');
        var removedIndex = parseInt(item.attr('data-hex-multy-item'));
        var items = $(this).closest('[data-hex-multy]').find('[data-hex-multy-item]');
        removeControls(item);
        item.remove();
        items.each(function (index, value) {
          if (index > removedIndex) {
            updateItemIndex($(this), --index);
          }
        });
      });


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
      if (hexForms[id] === undefined) {
        hexForms[id] = new HexFormSingle($('#' + id));
      }
      return hexForms[id];
    }
    return hexForms;
  }


  return hexFormInit;
})();

