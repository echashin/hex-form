/*global HexWidget:true,HexValidator:true */

var hexForm = (function (window, document) {
  'use strict';
  var hexForms = {};


  function Control(config) {
    var self = this;
    self.type = undefined;
    self.valid = true;
    self.name = undefined;
    var inputs = [];
    var form = config.form;

    var errors, timerId;

    self.formGroup = undefined;


    self.panels = [];
    self.tabs = [];

    var validators = [];
    var widgets = {};
    var events = {};
    var controlValue;
    self.disabled = false;
    self.readonly = false;

    self.setValid = function () {
      if (self.formGroup !== undefined) {
        self.formGroup.removeClass('has-error');
      }
      if (errors !== undefined) {
        errors.find('span').removeClass('active');
      }
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
      self.validate();
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

    var validateFunc = function () {
      var errorsCount = 0;
      if (errors !== undefined) {
        errors.find('span').removeClass('active');
      }

      if (!self.disabled) {
        for (var vIndex in validators) {
          if (validators.hasOwnProperty(vIndex)) {
            var validator = validators[vIndex];
            var value = self.getValue();
            var isValid = validator.isValid(value);
            if (isValid === false || isValid === 'false') {
              errorsCount++;
              if (errors !== undefined) {
                errors.find('span.error-' + validator.getClassName()).addClass('active');
              }
              break;
            }
          }
        }
      }

      if (errorsCount > 0) {
        self.valid = false;
        if (self.formGroup !== undefined) {
          self.formGroup.addClass('has-error');
        }
      }
      else {
        if (self.formGroup !== undefined) {
          self.formGroup.removeClass('has-error');
        }
        self.valid = true;
      }


      if (self.panels.length > 0) {
        var controlsValid = true;
        if (self.valid === true) {
          for (var c in form.controls) {
            if (form.controls.hasOwnProperty(c)) {
              var otherControl = form.controls[c];
              if (otherControl.valid === false) {
                for (var o in otherControl.panels) {
                  var otherPanel = otherControl.panels[o];
                  for (var s in self.panels) {
                    if (otherPanel === self.panels[s]) {
                      controlsValid = false;
                      break;
                    }
                  }
                }
              }
            }
          }
        } else {
          controlsValid = false;
        }

        if (controlsValid === true) {
          $.each(self.tabs, function (tKey, tab) {
            tab.removeClass('has-error');
          });
        } else {
          $.each(self.tabs, function (tKey, tab) {
            tab.addClass('has-error');
          });
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
      self.formGroup = inputs[0].closest('div.form-group');
      if (self.formGroup.size() === 0) {
        self.formGroup = undefined;
      } else {
        errors = self.formGroup.find('.errors');
        if (errors.size() === 0) {
          errors = undefined;
        }
      }

      if (inputs[0].parents('[role="tabpanel"]').size() > 0) {
        inputs[0].parents('[role="tabpanel"]').each(function () {
          var tabPanel = $(this);
          var tabId = tabPanel.attr('id');
          self.panels.push(tabId);
          var tabEl = $('.nav a[href="#' + tabId + '"]');
          if (tabEl.size() > 0) {
            self.tabs.push(tabEl);
          }
        });
      }

      self.setValid();
    };
    initControl(config);
  }

  function HexFormSingle(f) {
    var self = this;
    self.controls = {};
    self.errorText = 'Не удалось сохранить форму, попробуйте обновить страницу';
    self.invalidText = 'Форма содержит ошибки';
    var form = f;
    var formId = form.attr('id');
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
        if (input.parents('[data-hex-multy-item="$"]').size() === 0) {
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
                  self.controls[controlName] = new Control({
                    type: type,
                    inputs: [input],
                    form: self,
                    name: controlName
                  });
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
        }
      });
    };
    var getValues = function () {
      var values = {};
      for (var i in self.controls) {
        if (self.controls.hasOwnProperty(i)) {
          if (self.controls[i].disabled === false) {
            var name = self.controls[i].name;
            var value = self.controls[i].getValue();
            if (value === null || ($.isArray(value) && value.length === 0)) {
              value = '';
            } else {
              values[name] = value;
            }
          }
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
      event.stopPropagation();

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
          var formData = new FormData();

          $.each(data, function (k, v) {
            if ($.isArray(v) || $.isPlainObject(v)) {

              for (var j in v) {
                if (v[j] !== null && v[j] !== false && v[j] !== undefined) {
                  formData.append(k, v[j]);
                }
              }
            } else {
              formData.append(k, v);
            }
          });

          $.ajax({
            url: url,
            data: formData,
            type: method,
            dataType: 'json',
            processData: false,
            contentType: false,
            success: function (res) {
              if (res.success === true) {
                clearErrors();
                if (res.reload !== undefined) {
                  if (res.reload === true) {
                    window.location.href = window.location.href;
                  } else {
                    window.location.href = res.reload;
                  }
                } else {
                  self.loaderHide();
                }
              } else {
                self.loaderHide();
              }
              if (res.alerts !== undefined) {
                for (var m in res.alerts) {
                  var message = res.alerts[m];
                  form.find('.alerts').append($('<div>').addClass('alert alert-' + message.type).html(message.text));
                }
                self.loaderHide();
              }
            },
            error: function (jqXHR, textStatus) {
              self.loaderHide();
              form.find('.alerts').append($('<div>').addClass('alert alert-danger').html(self.errorText));
            }
          });
        }
      } else {
        form.find('.alerts div').remove();
        form.find('.alerts').append($('<div>').addClass('alert alert-danger').html(self.invalidText));
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

    function hexDisabled(panel) {
      if (panel.parents('[data-hex-multy-item="$"]').size() > 0) {
        return false;
      }
      var data = panel.data('hexDisabled');

      var searchValue = data.value;
      var control = self.controls[data.control];
      if (control === undefined) {
        throw new Error('Control "' + data.control + '" not found');
      }
      function onChange() {
        var v = control.getValue();
        var expSuccess = false;
        if (v === null || v === false || v === undefined || v === '' || ($.isArray(v) && v.length === 0)) {
          expSuccess = false;
        } else {
          if (typeof v === 'string') {
            if (v === searchValue) {
              expSuccess = true;
            }
          }
          if (typeof v === 'object') {
            if (v.indexOf(searchValue) >= 0) {
              expSuccess = true;
            }
          }
        }

        if (!expSuccess) {
          panel.hide();
          panel.find('input[type!="submit"],select,textarea').trigger('disable');
        } else {
          panel.show();
          panel.find('input[type!="submit"],select,textarea').trigger('enable');
        }
      }

      control.addEvent('change', onChange);
      control.trigger('change');
    }

    function convertDataName(name) {
      return name.replace('-', '').toUpperCase();
    }

    function hexBind(block, params) {
      var nodes = [];
      nodes.push(block);
      block.find('[data-hex-bind]').each(function () {
        nodes.push($(this));
      });
      function expr(ex) {
        var chars = ex.split('');
        var nn = [], op = [], index = 0, oplast = true;
        nn[index] = '';
        // Parse the expression
        for (var c = 0; c < chars.length; c++) {

          if (isNaN(parseInt(chars[c])) && chars[c] !== '.' && !oplast) {
            op[index] = chars[c];
            index++;
            nn[index] = '';
            oplast = true;
          } else {
            nn[index] += chars[c];
            oplast = false;
          }
        }

        // Calculate the expression
        ex = parseFloat(nn[0]);
        for (var o = 0; o < op.length; o++) {
          var num = parseFloat(nn[o + 1]);
          switch (op[o]) {
            case '+':
              ex = ex + num;
              break;
            case '-':
              ex = ex - num;
              break;
            case '*':
              ex = ex * num;
              break;
            case '/':
              ex = ex / num;
              break;
          }
        }

        return ex;
      }

      function appendParams(template) {
        if (typeof template === 'object') {
          for (var i in template) {
            template[i] = appendParams(template[i]);
          }
        } else {
          for (var p in params) {
            template = template.replace(new RegExp(p, 'g'), params[p]);
          }
          if (/\%/.test(template)) {
            template = template.replace(/\%(.*?)\%/g, function (value) {
              return expr(value.replace(/\%/g, ''));
            });
          }
        }
        return template;
      }

      for (var n in nodes) {
        var bParams = nodes[n].data('hexBind');
        for (var attr in bParams) {
          var tpl = appendParams(bParams[attr]);

          if (attr !== 'html') {
            if (/^data/.test(attr)) {
              var dataParamName = attr.replace(/^data-/, '');
              dataParamName = dataParamName.replace(/(\-[a-z])/g, convertDataName);
              nodes[n].data(dataParamName, tpl);
            }
            if (attr === 'name') {
              var oldName = nodes[n].attr('name');
              if (oldName !== undefined && self.controls[oldName] !== undefined) {
                var oldControl = self.controls[oldName];
                oldControl.name = tpl;
                self.controls[tpl] = oldControl;
                delete self.controls[oldName];
              }
            }
            if (typeof tpl === 'object') {
              nodes[n].attr(attr, JSON.stringify(tpl));
            } else {
              nodes[n].attr(attr, tpl);
            }
          } else {
            nodes[n].html(tpl);
          }

        }
      }
    }

    function multy(block) {
      var multyConf = block.data('hex-multy');

      var tabs, baseTab;
      var allowNull = false;
      if (multyConf.allow_empty !== undefined && multyConf.allow_empty === true) {
        allowNull = true;
      }

      if (block.find('[data-hex-multy-tabs]').size() > 0) {
        tabs = block.find('[data-hex-multy-tabs]');
        baseTab = tabs.find('[data-hex-multy-tab="$"]').clone(false);

        tabs.find('[data-hex-multy-tab="$"]').remove();
      }


      var firstBlock = block.find('[data-hex-multy-item="$"]');
      var baseBlock = firstBlock.clone(false);
      firstBlock.remove();

      function updateItemIndex(item, newIndex) {
        hexBind(item, {'@index': newIndex});
      }

      function multyCheck() {
        if (allowNull === false) {
          var items = block.find('[data-hex-multy-item]');
          if (items.size() <= 1) {
            block.find('[data-hex-multy-remove]').attr('disabled', 'disabled');
          } else {
            block.find('[data-hex-multy-remove]').removeAttr('disabled');
          }
        }
      }


      block.on('click', '[data-hex-multy-add]', function () {
        var items = $(this).closest('[data-hex-multy]').find('[data-hex-multy-item]');
        var newIndex = items.size();
        var clonedFieldset = baseBlock.clone(false);
        clonedFieldset.find('[data-hex-multy-hide]').remove();
        clonedFieldset.find('[data-hex-multy-attr]').each(function () {
          var element = $(this);
          var attrConf = element.data('hex-multy-attr');
          if (attrConf.add !== undefined) {
            $.each(attrConf.add, function (i, attr) {
              for (var aName in attr) {
                element.attr(aName, attr[aName]);
              }
            });
          }
          if (attrConf.remove !== undefined) {
            for (var a in attrConf.remove) {
              element.removeAttr(attrConf.remove[a]);
            }
          }
        });

        updateItemIndex(clonedFieldset, newIndex);
        clonedFieldset.appendTo(block.find('[data-hex-multy-items]'));
        if (tabs !== undefined) {
          var clonedTab = baseTab.clone(false);
          updateItemIndex(clonedTab, newIndex);
          if (block.find('[data-hex-multy-tab]:last').size() > 0) {
            clonedTab.insertAfter(block.find('[data-hex-multy-tab]:last'));
          } else {
            tabs.prepend(clonedTab);
          }
        }

        addControls(clonedFieldset);
        if (tabs !== undefined) {
          $('a[href="#' + clonedFieldset.attr('id') + '"]').trigger('click');
        }
        if (clonedFieldset.find('[data-hex-disabled]').size() > 0) {
          clonedFieldset.find('[data-hex-disabled]').each(function () {
            hexDisabled($(this));
          });
        }
        multyCheck();
      });

      block.on('click', '[data-hex-multy-remove]', function () {
          var item = $(this).closest('[data-hex-multy-item]');
          var removedIndex = item.data('hexMultyItem');
          var items = block.find('[data-hex-multy-item]');
          removeControls(item);
          item.fadeOut(500, function () {
            item.remove();
            items.each(function () {
              if ($(this).data('hexMultyItem') > removedIndex) {
                updateItemIndex($(this), $(this).data('hexMultyItem') - 1);
              }
            });
            if (tabs !== undefined) {
              tabs.find('[data-hex-multy-tab="' + removedIndex + '"]').remove();
              tabs.find('[data-hex-multy-tab]').each(function () {
                if ($(this).data('hexMultyTab') > removedIndex) {
                  updateItemIndex($(this), $(this).data('hexMultyTab') - 1);
                }
              });


              if (tabs.find('[data-hex-multy-tab=' + removedIndex + ']').size() > 0) {
                tabs.find('[data-hex-multy-tab=' + removedIndex + ']').find('a[role="tab"]').trigger('click');
              } else {
                if (tabs.find('[data-hex-multy-tab]:nth-child(' + (removedIndex) + ')').size() > 0) {
                  tabs.find('[data-hex-multy-tab]:nth-child(' + (removedIndex ) + ')').find('a[role="tab"]').trigger('click');
                }
              }
            }
            multyCheck();
          });
        }
      );

      multyCheck();
    }


    var init = function () {
      form.addClass('loader-container').append('<div class="loader"></div>');
      $(document).on('submit', '#' + formId, submit);
      $(document).on('reset', '#' + formId, reset);
      if (form.find('.loader').size() === 0) {
        form.append('<div class="loader"></div>');
      }
      addControls(form);


      if (form.find('[data-hex-multy]').size() > 0) {
        form.find('[data-hex-multy]').each(function () {
          multy($(this));
        });
      }

      if (form.find('[data-hex-disabled]').size() > 0) {
        form.find('[data-hex-disabled]').each(function () {
          hexDisabled($(this));
        });
      }


    };

    init();
    return self;
  }


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
})(window, document);

