/* global moment:true*/
var hex = (function (h) {
  'use strict';
  h.Control = function (config) {


    //DOM nodes (<input type="text"> || <input type="radio" value="male"><input type="radio" value="female">)
    var inputs = [];
    //Значение, значение по умолчанию (не обязательно верное)
    var
      controlName,//Имя инпута, так же является именем свойства в объекте данных блока
      type,//тип
      controlValue,//значение
      defaultValue,//значение по умолчанию
      errors = [], //ошибки
      handlers = {},//привязанные к контролу события
      validationEvents = {},//события при которых происходит запуск валидации
      isReadonly = false, //только для чтения или нет
      isDisabled = false,//отключен или нет
      isValid = true,//Валиден или нет
      validators = [],//подключенные валидаторы
      widgets = {}, //подключенные виджеты
      checkedValue = true, //для чекбокса, значение при включенном
      uncheckedValue = false, //для чекбокса, значение при выключенном
      lastValidateValue,
      formGroup,
      errorsBlock;


    function getDomValue() {
      switch (type) {
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
                var v = '';
                var format = 'YYYY-MM-DD';
                if (picker.timePicker === true) {
                  format += ' HH:mm';
                }
                v += picker.startDate.format(format);
                if (picker.singleDatePicker === false) {
                  var endDate = picker.endDate.format(format);
                  v += ' - ' + endDate;
                }
                return v;
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
          if (inputs.length < 2) {
            if (inputs[0].is(':checked') === true) {
              inputs[0].closest('label').addClass('checked');
              return checkedValue;
            } else {
              inputs[0].closest('label').removeClass('checked');
              return uncheckedValue;
            }
          } else {
            var vals = [];
            for (var ci = 0, l = inputs.length; ci < l; ci++) {
              if (inputs[ci].is(':checked') === true) {
                vals.push(inputs[ci].val());
                inputs[ci].closest('label').addClass('checked');
              } else {
                inputs[ci].closest('label').removeClass('checked');
                if (inputs[ci].attr('data-hex-false-value') !== undefined) {
                  vals.push(inputs[ci].attr('data-hex-false-value'));
                }
              }
            }
            return vals;
          }
        }
      }
    }

    function setDomValue() {
      switch (type) {
        case 'file':
        {
          break;
        }
        case 'checkbox':
        {
          if (inputs.length < 2) {
            if (checkedValue === controlValue) {
              inputs[0].closest('label').addClass('checked');
            } else {
              inputs[0].closest('label').removeClass('checked');
            }
          } else {

            for (var ci = 0, l = inputs.length; ci < l; ci++) {
              if (controlValue.indexOf(inputs[ci].val()) !== -1) {
                inputs[ci].closest('label').addClass('checked');
                inputs[ci].prop('checked', true);
              } else {
                inputs[ci].closest('label').removeClass('checked');
                inputs[ci].prop('checked', false);
              }
            }
          }
          break;
        }
        case 'radio':
        {
          for (var i in inputs) {
            if (inputs.hasOwnProperty(i)) {
              if (inputs[i].attr('value') === controlValue) {
                inputs[i].prop('checked', true);
              } else {
                inputs[i].prop('checked', false);
              }
            }
          }
          break;
        }
        case 'text':
        default:
        {
          if (widgets.date !== undefined) {
            if (!h.utils.isEmpty(controlValue)) {
              var picker = inputs[0].data('daterangepicker');
              var dates = controlValue.split(' - ');
              if (dates[0] !== undefined) {
                picker.setStartDate(moment(dates[0]));
              }
              if (dates[1] !== undefined) {
                picker.setEndDate(moment(dates[1]));
              }
            }
          } else {
            inputs[0].val(controlValue);
            inputs[0].trigger('change');
          }
          break;
        }
      }
    }

    function getName() {
      return controlName;
    }

    function on(eventName, fn) {
      if (handlers[eventName] === undefined) {
        handlers[eventName] = [];
      }
      if (handlers[eventName].indexOf(fn) < 0) {
        handlers[eventName].push(fn);
      }
    }

    function off(eventName, fn) {
      if (handlers[eventName] !== undefined) {
        handlers[eventName].splice(handlers[eventName].indexOf(fn), 1);
      }
    }

    function trigger(eventName, params) {
      if (handlers[eventName] !== undefined) {
        for (var fnIndex in handlers[eventName]) {
          var func = handlers[eventName][fnIndex];
          func(params);
        }
      } else {
        return true;
      }
    }


    function getInputs() {
      return inputs;
    }

    function setValue(v) {
      if (controlValue !== v) {
        controlValue = v;
        setDomValue();
      }
    }

    function getValue() {
      if (isDisabled) {
        return undefined;
      }
      return controlValue;
    }

    function sortByProperty(prop) {
      return function (a, b) {
        if (typeof a[prop] === 'number') {
          return (a[prop] - b[prop]);
        } else {
          return ((a[prop] < b[prop]) ? -1 : ((a[prop] > b[prop]) ? 1 : 0));
        }
      };
    }

    function hideErrors() {
      if (formGroup !== undefined) {
        formGroup.removeClass('has-error');
      }
      if (errorsBlock !== undefined) {
        errorsBlock.find('span').removeClass('active');
      }
    }

    function showErrors() {
      if (errorsBlock !== undefined) {
        for (var i = 0, length = errors.length; i < length; i++) {
          errorsBlock.find('.error-' + errors[i]).addClass('active');
        }
      }
      if (formGroup !== undefined) {
        formGroup.addClass('has-error');
      }
    }

    function reset() {
      lastValidateValue = defaultValue;
      setValue(defaultValue);
      hideErrors();
    }


    function readonly(v) {
      if (v === undefined) {
        return isReadonly;
      } else {
        if (v !== false && v !== true) {
          throw new Error('Wrong value in readonly method ');
        }
        for (var i = 0, length = inputs.length; i < length; i++) {
          inputs[i].prop('readonly', v);
        }
        isReadonly = v;
      }
    }

    function disable() {
      for (var i = 0, len = inputs.length; i < len; i++) {
        inputs[i].prop('disabled', true);
      }
      isDisabled = true;
      trigger('disable');
    }

    function enable() {
      for (var i = 0, len = inputs.length; i < len; i++) {
        inputs[i].prop('disabled', false);
      }
      isDisabled = false;
      trigger('enable');
    }


    function validate(update) {

      if (update === false) {
        return isValid;
      }
      else {
        lastValidateValue = controlValue;
        hideErrors();
        errors = [];
        if (!isDisabled) {
          for (var v in validators) {
            if (validators.hasOwnProperty(v)) {
              if (!validators[v].isValid(controlValue)) {
                errors.push(validators[v].getClassName());
                break;
              }
            }
          }
        }
        if (errors.length > 0) {
          isValid = false;
          showErrors();
        }
        else {
          isValid = true;
          hideErrors();
        }
        trigger('validate', update);
        return isValid;
      }
    }

    var control = {
      getName: getName,
      setValue: setValue,
      getValue: getValue,
      reset: reset,
      readonly: readonly,
      disable: disable,
      enable: enable,
      validate: validate,
      getInputs: getInputs,
      inputs: inputs,
      on: on,
      off: off,
      trigger: trigger,
      toString: function () {
        return getValue();
      },
      valueOf: function () {
        return getValue();
      },
      toJSON: function () {
        return getValue();
      }
    };

    function addValidator(vType, conf) {
      var vConfig = {};
      vType = h.utils.toCamel(vType);
      if (conf !== undefined && conf !== '') {
        $.extend(vConfig, jQuery.parseJSON(conf));
      }

      if (h.validators[vType] !== undefined) {
        var validator = new h.validators[vType](control, vConfig);
        var validatorEvents = validator.getEvents();
        for (var eventName in validatorEvents) {
          if (validatorEvents.hasOwnProperty(eventName)) {
            validationEvents[validatorEvents[eventName]] = true;
          }
        }
        validators.push(validator);
      } else {
        console.warn('Validator "' + vType + '" not loaded!');
      }
    }

    function addWidget(wType, conf) {
      wType = h.utils.toCamel(wType);
      var widgetConfig = {};
      if (conf !== undefined && conf !== '') {
        $.extend(widgetConfig, jQuery.parseJSON(conf));
      }
      if (h.widgets[wType] !== undefined) {
        widgets[wType] = new h.widgets[wType](control, widgetConfig);
      } else {
        console.warn('Widget "' + wType + '" not loaded!');
      }
    }

    function addInput(input) {
      inputs.push(input);
      //Подключение валидаторов и виджетов
      var attributes = h.utils.getAttributes(input);
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

      input.on('change', function () {
        controlValue = getDomValue();
        trigger('change', controlValue);
      });

      if (type === 'text' || type === 'textarea' || type === 'password') {
        input.on('keyup', function () {
          controlValue = getDomValue();
          input.trigger('change');
        });
      }

      validators.sort(sortByProperty('weight'));
      for (var eventName in validationEvents) {
        if (validationEvents.hasOwnProperty(eventName)) {
          input.on(eventName, validate);
        }
      }


      if (input.prop('disabled')) {
        disable();
      }
      if (input.prop('readonly')) {
        readonly(true);
      }

      input.on('disable', function () {
        disable();
      });
      input.on('enable', function () {
        enable();
      });

    }


    function init(conf) {
      type = conf.type;

      if (type === 'checkbox') {
        if (conf.trueValue !== undefined) {
          checkedValue = conf.trueValue;
        }
        if (conf.falseValue !== undefined) {
          uncheckedValue = conf.falseValue;
        }
      }

      controlName = conf.name;

      if (controlName === undefined) {
        console.error('Control dont have name');
        console.error(conf.inputs);
      }


      formGroup = conf.formGroup;

      errorsBlock = conf.errorsBlock;

      if (conf.inputs !== undefined) {
        for (var i in conf.inputs) {
          if (conf.inputs.hasOwnProperty(i)) {
            addInput(conf.inputs[i]);
          }
        }
      }
      controlValue = defaultValue = getDomValue();
      lastValidateValue = controlValue;

      hideErrors();
    }

    init(config);
    return control;
  };

  return h;
}(hex));

