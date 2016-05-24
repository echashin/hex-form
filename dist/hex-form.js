(function (window) {
  'use strict';
  var h = {'widgets': {}, 'validators': {}, 'utils': {}};

  h.utils.toCamel = function (string) {
    return string.replace(/[-_]([a-z])/g, function (g) {
      return g[1].toUpperCase();
    });
  };

  h.utils.isEmpty = function (v) {
    return !!(v === null || v === false || v === undefined || v === '' || ($.isArray(v) && v.length === 0));
  };
  h.utils.md5 = function (string) {

    function rotateLeft(lValue, iShiftBits) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function addUnsigned(lX, lY) {
      var lX4, lY4, lX8, lY8, lResult;
      lX8 = (lX & 0x80000000);
      lY8 = (lY & 0x80000000);
      lX4 = (lX & 0x40000000);
      lY4 = (lY & 0x40000000);
      lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
      if (lX4 & lY4) {
        return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
      }
      if (lX4 | lY4) {
        if (lResult & 0x40000000) {
          return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
        } else {
          return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        }
      } else {
        return (lResult ^ lX8 ^ lY8);
      }
    }

    function funcF(x1, y1, z1) {
      return (x1 & y1) | ((~x1) & z1);
    }

    function funcG(x1, y1, z1) {
      return (x1 & z1) | (y1 & (~z1));
    }

    function funcH(x1, y1, z1) {
      return (x1 ^ y1 ^ z1);
    }

    function functI(x1, y1, z1) {
      return (y1 ^ (x1 | (~z1)));
    }

    function funcFF(a1, b1, c1, d1, x1, s1, ac1) {
      a1 = addUnsigned(a1, addUnsigned(addUnsigned(funcF(b1, c1, d1), x1), ac1));
      return addUnsigned(rotateLeft(a1, s1), b1);
    }

    function funcGG(a1, b1, c1, d1, x1, s1, ac1) {
      a1 = addUnsigned(a1, addUnsigned(addUnsigned(funcG(b1, c1, d1), x1), ac1));
      return addUnsigned(rotateLeft(a1, s1), b1);
    }

    function funcHH(a1, b1, c1, d1, x1, s1, ac1) {
      a1 = addUnsigned(a1, addUnsigned(addUnsigned(funcH(b1, c1, d1), x1), ac1));
      return addUnsigned(rotateLeft(a1, s1), b1);
    }

    function funcII(a1, b1, c1, d1, x1, s1, ac1) {
      a1 = addUnsigned(a1, addUnsigned(addUnsigned(functI(b1, c1, d1), x1), ac1));
      return addUnsigned(rotateLeft(a1, s1), b1);
    }

    function convertToWordArray(st) {
      var lWordCount;
      var lMessageLength = st.length;
      var lNumberOfWordsTemp1 = lMessageLength + 8;
      var lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
      var lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
      var lWordArray = Array(lNumberOfWords - 1);
      var lBytePosition = 0;
      var lByteCount = 0;
      while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = (lWordArray[lWordCount] | (st.charCodeAt(lByteCount) << lBytePosition));
        lByteCount++;
      }
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
      return lWordArray;
    }

    function wordToHex(lValue) {
      var wordToHexValue = '', wordToHexValueTemp = '', lByte, lCount;
      for (lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255;
        wordToHexValueTemp = '0' + lByte.toString(16);
        wordToHexValue = wordToHexValue + wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
      }
      return wordToHexValue;
    }

    function utf8Encode(st) {
      st = st.replace(/\r\n/g, '\n');
      var utftext = '';

      for (var n = 0; n < st.length; n++) {

        var c1 = st.charCodeAt(n);

        if (c1 < 128) {
          utftext += String.fromCharCode(c1);
        }
        else if ((c1 > 127) && (c1 < 2048)) {
          utftext += String.fromCharCode((c1 >> 6) | 192);
          utftext += String.fromCharCode((c1 & 63) | 128);
        }
        else {
          utftext += String.fromCharCode((c1 >> 12) | 224);
          utftext += String.fromCharCode(((c1 >> 6) & 63) | 128);
          utftext += String.fromCharCode((c1 & 63) | 128);
        }

      }

      return utftext;
    }

    var x = [];
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    string = utf8Encode(string);

    x = convertToWordArray(string);

    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
      AA = a;
      BB = b;
      CC = c;
      DD = d;
      a = funcFF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
      d = funcFF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
      c = funcFF(c, d, a, b, x[k + 2], S13, 0x242070DB);
      b = funcFF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
      a = funcFF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
      d = funcFF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
      c = funcFF(c, d, a, b, x[k + 6], S13, 0xA8304613);
      b = funcFF(b, c, d, a, x[k + 7], S14, 0xFD469501);
      a = funcFF(a, b, c, d, x[k + 8], S11, 0x698098D8);
      d = funcFF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
      c = funcFF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
      b = funcFF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
      a = funcFF(a, b, c, d, x[k + 12], S11, 0x6B901122);
      d = funcFF(d, a, b, c, x[k + 13], S12, 0xFD987193);
      c = funcFF(c, d, a, b, x[k + 14], S13, 0xA679438E);
      b = funcFF(b, c, d, a, x[k + 15], S14, 0x49B40821);
      a = funcGG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
      d = funcGG(d, a, b, c, x[k + 6], S22, 0xC040B340);
      c = funcGG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
      b = funcGG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
      a = funcGG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
      d = funcGG(d, a, b, c, x[k + 10], S22, 0x2441453);
      c = funcGG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
      b = funcGG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
      a = funcGG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
      d = funcGG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
      c = funcGG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
      b = funcGG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
      a = funcGG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
      d = funcGG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
      c = funcGG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
      b = funcGG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
      a = funcHH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
      d = funcHH(d, a, b, c, x[k + 8], S32, 0x8771F681);
      c = funcHH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
      b = funcHH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
      a = funcHH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
      d = funcHH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
      c = funcHH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
      b = funcHH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
      a = funcHH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
      d = funcHH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
      c = funcHH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
      b = funcHH(b, c, d, a, x[k + 6], S34, 0x4881D05);
      a = funcHH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
      d = funcHH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
      c = funcHH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
      b = funcHH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
      a = funcII(a, b, c, d, x[k + 0], S41, 0xF4292244);
      d = funcII(d, a, b, c, x[k + 7], S42, 0x432AFF97);
      c = funcII(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
      b = funcII(b, c, d, a, x[k + 5], S44, 0xFC93A039);
      a = funcII(a, b, c, d, x[k + 12], S41, 0x655B59C3);
      d = funcII(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
      c = funcII(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
      b = funcII(b, c, d, a, x[k + 1], S44, 0x85845DD1);
      a = funcII(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
      d = funcII(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
      c = funcII(c, d, a, b, x[k + 6], S43, 0xA3014314);
      b = funcII(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
      a = funcII(a, b, c, d, x[k + 4], S41, 0xF7537E82);
      d = funcII(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
      c = funcII(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
      b = funcII(b, c, d, a, x[k + 9], S44, 0xEB86D391);
      a = addUnsigned(a, AA);
      b = addUnsigned(b, BB);
      c = addUnsigned(c, CC);
      d = addUnsigned(d, DD);
    }

    var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

    return temp.toLowerCase();

  };

  window.hex = h;
}(window));


var hex = (function (h) {
  'use strict';
  h.Block = function (element, form, parentBlock) {
    var block = this;
    block.element = undefined;
    //Вложенные блоки
    block.childBlocks = [];
    //Собственные контролы
    block.controls = [];
    //Родительский блок если есть
    block.parent = undefined;
    var tab;
    //id нашего блока
    block.id = undefined;
    block.valid = true;
    block.form = undefined;

    block.hideErrors = function () {
      if (tab !== undefined) {
        tab.removeClass('has-error');
      }
    };

    block.findBlockById = function (fId) {
      if (block.id === fId) {
        return block;
      } else {
        for (var b in block.childBlocks) {
          var finded = block.childBlocks[b].findBlockById(fId);
          if (finded !== false) {
            return finded;
          }
        }
        return false;
      }
    };

    block.addBlock = function (blockEl) {
      block.childBlocks.push(new h.Block(blockEl, form, block));
    };

    block.showErrors = function () {
      if (tab !== undefined) {
        tab.addClass('has-error');
      }
    };

    block.isValid = function (update) {
      var blockValid = true;
      for (var c in block.controls) {
        if (!block.controls[c].isValid(update)) {
          blockValid = false;
        }
      }
      for (var b in block.childBlocks) {
        if (!block.childBlocks[b].isValid(update)) {
          blockValid = false;
        }
      }
      block.valid = blockValid;
      if (tab !== undefined) {
        if (blockValid) {
          tab.removeClass('has-error');
        } else {
          block.showErrors();
        }
      }
      return block.valid;
    };

    block.setValid = function () {

    };


    block.getValues = function () {

    };


    //Добавляем контролы в блок
    var addControls = function (newInputs) {
      var tmpConfigs = {};
      for (var i in newInputs) {
        var input = newInputs[i];
        if (input.parents('[data-hex-multy-item="$"]').size() <= 0) {
          var controlName = input.attr('name');
          var errorsBlock;
          var formGroup = input.closest('.form-group');
          if (formGroup.size() <= 0) {
            formGroup = undefined;
          } else {
            errorsBlock = formGroup.find('.errors');
            if (errorsBlock.size() <= 0) {
              errorsBlock = undefined;
            }
          }

          var tagName = input.prop('tagName').toLowerCase();
          var inputType = tagName;

          var controlConfig = {
            type: inputType,
            inputs: [input],
            formGroup: formGroup,
            errorsBlock: errorsBlock,
            block: block,
            name: controlName
          };


          switch (tagName) {
            case 'select':
            case 'textarea':
            {
              break;
            }
            case 'input':
            {
              inputType = input.attr('type').toLowerCase();
              switch (inputType) {
                default:
                {
                  controlConfig.type = inputType;
                  break;
                }
                case 'checkbox':
                {
                  inputType = 'checkbox';
                  controlConfig.type = inputType;
                  if (input.attr('value') !== undefined) {
                    controlConfig.trueValue = input.attr('value');
                  }
                  if (input.attr('data-hex-true-value') !== undefined) {
                    controlConfig.trueValue = input.attr('data-hex-true-value');
                  }
                  if (input.attr('data-hex-false-value') !== undefined) {
                    controlConfig.falseValue = input.attr('data-hex-false-value');
                  }
                  break;
                }
                case 'radio':
                {
                  controlConfig.type = 'radio';
                  break;
                }
              }
              break;
            }
          }
          if (tmpConfigs[controlName] === undefined) {
            tmpConfigs[controlName] = controlConfig;
          } else {
            tmpConfigs[controlName].inputs.push(input);
          }
        }
      }

      for (var cName in tmpConfigs) {
        if (tmpConfigs.hasOwnProperty(cName)) {
          var newControl = new hex.Control(tmpConfigs[cName]);
          block.controls.push(newControl);
          block.form.controls.push(newControl);
        }
      }
    };

    function findChildrenBlocks() {
      var ownInputs = [];
      var ownBlocks = {};
      //Находим все инпуты внутри блока
      element.find('input[type!="submit"],select,textarea').each(function () {
        var el = $(this);
        var parentblockId = el.parents('[data-hex-block][data-hex-multy-item!="$"]:first').attr('id');
        //Инпут находится непосредственно внутри нашего блока
        if (parentblockId === block.id) {
          ownInputs.push(el);
        }
      });

      element.find('[data-hex-block][data-hex-multy-item!="$"]').each(function () {
        var testBlock = $(this);
        if (testBlock.parents('[data-hex-block][data-hex-multy-item!="$"]:first').attr('id') === block.id) {
          ownBlocks[testBlock.attr('id')] = testBlock;
        }
      });

      for (var b in ownBlocks) {
        block.addBlock(ownBlocks[b]);
      }
      addControls(ownInputs);
    }

    function initContainer() {
      block.id = element.attr('id');
      block.form = form;
      block.element = element;
      block.parent = parentBlock;
      if ($('[href="#' + block.id + '"]').size() > 0) {
        tab = $('[href="#' + block.id + '"]');
      }
      if (block.id === undefined) {
        console.log(element);
        throw new Error('[data-hex-block] must have id attr');
      }
      findChildrenBlocks();
    }


    initContainer();

  };
  return h;
}(hex));


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
      if (self.block.form.mainBlock !== undefined) {
        self.block.form.mainBlock.isValid(false);
      }
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


var hex = (function (h) {
  'use strict';
  h.widgets.passwordShow = function (control) {
    var button, input;
    var currentType = 'password';

    function init() {
      input = control.getInputs()[0];
      button = input.closest('.form-group').find('button.password-show');
      button.bind('click', function (event) {
        event.preventDefault();
        if (currentType === 'password') {
          input.attr('type', 'text');
          button.addClass('active');
          currentType = 'text';
        } else {
          input.attr('type', 'password');
          button.removeClass('active');
          currentType = 'password';
        }
        input.focus();
        return false;
      });
    }

    init();
  };

  return h;
}(hex));

var hex = (function (h) {
  'use strict';
  h.widgets.passwordStrength = function (control) {
    var self = this;
    var input, passMeter;
    var characters = 0;
    var capitalletters = 0;
    var loweletters = 0;
    var number = 0;
    var special = 0;
    var upperCase = new RegExp('[A-ZА-Я]');
    var lowerCase = new RegExp('[a-zа-я]');
    var numbers = new RegExp('[0-9]');
    var specialchars = new RegExp('([!,%,&,@,#,$,^,*,?,_,~])');

    function checkStrength(value) {
      if (value.length > 8) {
        characters = 1;
      } else {
        characters = 0;
      }

      if (value.match(upperCase)) {
        capitalletters = 1;
      } else {
        capitalletters = 0;
      }

      if (value.match(lowerCase)) {
        loweletters = 1;
      } else {
        loweletters = 0;
      }

      if (value.match(numbers)) {
        number = 1;
      } else {
        number = 0;
      }

      if (value.match(specialchars)) {
        special = 1;
      } else {
        special = 0;
      }
      return characters + capitalletters + loweletters + number + special;
    }

    self.weight = 0;


    function init() {
      input = control.getInputs()[0];
      passMeter = input.closest('.form-group').find('.password-strength div');
      input.bind('keyup change', function () {
        var value = input.val();
        passMeter.attr('class', 's-' + checkStrength(value));
      });
    }

    init();
  };

  return h;
}(hex));

/* global moment:true*/
var hex = (function (h) {
  'use strict';
  var locale = $('html').attr('lang');
  if (h.utils.isEmpty(locale)) {
    throw new Error('Doesn`t set lang attr in html tag');
  }
  moment.locale(locale.toLowerCase());
  h.widgets.date = function (control, config) {
    var input;
    var parentMin = false;
    var parentMax = false;
    var minDate = false;
    var maxDate = false;

    function init() {
      input = control.getInputs()[0];
      var localeData = moment.localeData();
      var localeFormat = localeData.longDateFormat('L');
      if (config.timePicker !== undefined && config.timePicker === true) {
        localeFormat += ' ' + localeData.longDateFormat('LT');
      }

      var defaultSettings = {
        'autoUpdateInput': false,
        'linkedCalendars': false,
        'singleDatePicker': true,
        'locale': {
          'format': localeFormat,
          'separator': ' - ',
          'applyLabel': 'Готово',
          'cancelLabel': 'Отмена',
          'fromLabel': 'От',
          'toLabel': 'До',
          'customRangeLabel': 'Custom',
          'daysOfWeek': moment.weekdaysShort(),
          'monthNames': moment.months(),
          'firstDay': localeData.firstDayOfWeek()
        }
      };
      if (config.parentMin !== undefined) {
        minDate = $(config.parentMin).val();
        if (!h.utils.isEmpty(minDate)) {
          defaultSettings.minDate = minDate;
        }
        parentMin = config.parentMin;
        delete config.parentMin;
      }

      if (config.parentMax !== undefined) {
        maxDate = $(config.parentMax).val();
        if (!h.utils.isEmpty(maxDate)) {
          defaultSettings.maxDate = maxDate;
        }
        parentMax = config.parentMax;
        delete config.parentMax;
      }

      $.extend(defaultSettings, config);

      var mask = defaultSettings.locale.format.replace(/[H]/g, '9').replace(/[m]/g, '9').replace(/[D]+/g, 'd').replace(/[M]+/g, 'm').replace(/[Y]+/g, 'y');
      if (defaultSettings.singleDatePicker === false) {
        mask += defaultSettings.locale.separator + mask;
      }
      input.inputmask(mask);


      var onChange = function () {
        var picker = input.data('daterangepicker');
        var value = picker.startDate.format(defaultSettings.locale.format);
        if (defaultSettings.singleDatePicker === false) {
          value += defaultSettings.locale.separator + picker.endDate.format(defaultSettings.locale.format);
        }
        input.val(value).trigger('change');
      };

      //Инициализация

      input.daterangepicker(defaultSettings);

      input.on('apply.daterangepicker', function () {
        onChange();
      });

      var parentMaxChange = function () {
        maxDate = $(parentMax).val();
        if (h.utils.isEmpty(maxDate)) {
          control.disable();
          input.val('').trigger('change');
        } else {
          defaultSettings.maxDate = maxDate;
          input.daterangepicker(defaultSettings);
          input.on('apply.daterangepicker', function () {
            onChange();
          });

          control.enable();
          if (h.utils.isEmpty(input.val())) {

            if (!h.utils.isEmpty(minDate)) {
              input.data('daterangepicker').setStartDate(minDate);
              input.data('daterangepicker').setEndDate(minDate);
            } else {
              input.data('daterangepicker').setStartDate(maxDate);
              input.data('daterangepicker').setEndDate(maxDate);
            }
          }
          onChange();
        }
      };

      var parentMinChange = function () {
        minDate = $(parentMin).val();
        if (h.utils.isEmpty(minDate)) {
          control.disable();
          input.val('').trigger('change');
        } else {
          defaultSettings.minDate = minDate;
          input.daterangepicker(defaultSettings);
          input.on('apply.daterangepicker', function () {
            onChange();
          });
          control.enable();
          if (h.utils.isEmpty(input.val())) {
            input.data('daterangepicker').setStartDate(minDate);
            input.data('daterangepicker').setEndDate(minDate);
          }
          onChange();
          if (parentMax !== false) {
            parentMaxChange();
          }
        }
      };


      if (parentMin !== false) {
        $(parentMin).on('change', function () {
          parentMinChange();
        });
      }

      if (parentMax !== false) {
        $(parentMax).on('change', function () {
          parentMaxChange();
        });
      }
      if (parentMax !== false) {
        parentMaxChange();
      }
      if (parentMin !== false) {
        parentMinChange();
      }


    }


    init();
  };

  return h;
}(hex));

var hex = (function (h) {
  'use strict';
  h.widgets.mask = function (control, config) {
    var input, mask;

    function init() {
      input = control.getInputs()[0];
      if (config.mask !== undefined) {
        mask = config.mask;
      } else {
        throw new Error(input.attr('name') + ' doesn`t set mask param');
      }
      input.inputmask(mask);
    }

    init();
  };

  return h;
}(hex));

var hex = (function (h) {
  'use strict';
  h.widgets.phone = function (control, config) {
    var input;
    var mask = '+7(999)999-99-99';

    function init() {
      input = control.getInputs()[0];
      if (config.mask !== undefined) {
        mask = config.mask;
      }
      input.inputmask(mask);
    }

    init();
  };

  return h;
}(hex));

var hex = (function (h) {
  'use strict';
  h.widgets.select2 = function (control, config) {
    var input;
    var mode = 'local';

    function init() {
      input = control.getInputs()[0];
      var placeholder = config.placeholder || '';
      var defaultSettings = {
        theme: 'bootstrap',
        allowClear: true,
        placeholder: placeholder,
        minimumResultsForSearch: 10
      };

      if (input.attr('multiple') !== undefined) {
        defaultSettings.closeOnSelect = false;
      }
      if (config.url !== undefined) {
        mode = 'ajax';
        var selected = input.find('option[selected]');
        config.ajax = {
          url: config.url,
          method: 'POST',
          dataType: 'json',
          delay: 250,
          data: function (params) {
            return {
              search: params.term, // search term
              page: params.page
            };
          },
          processResults: function (data, params) {
            params.page = params.page || 1;
            return {
              results: data.rows,
              pagination: {
                more: (params.page * data.limit) < data.total
              }
            };
          },
          cache: false
        };


        delete config.url;

        if (config.parent !== undefined) {
          var pId = config.parent.selector;
          var paramName = config.parent.param || 'parent_id';
          if (h.utils.isEmpty($(pId).val())) {
            control.disable();
            input.val('').trigger('change');
          }

          $(pId).on('change', function () {
            if (h.utils.isEmpty($(this).val())) {
              control.disable();
              input.val('').trigger('change');
            } else {
              control.enable();
              input.val('').trigger('change');
            }
          });
          delete config.parent;

          var parentId = function () {
            return $(pId).val();
          };

          config.ajax.data = function (params) {
            var requestParams = {
              search: params.term, // search term
              page: params.page
            };
            requestParams[paramName] = parentId;
            return requestParams;
          };
        }
      }

      $.extend(defaultSettings, config);
      //enable select2 plugin
      input.select2(defaultSettings);
      if (mode === 'ajax') {
        selected.each(function () {
          input.append($(this));
        });
        input.trigger('change');
      }
    }

    init();
  };

  return h;
}(hex));

var hex = (function (h) {
  'use strict';
  h.widgets.filesimple = function (control) {
    var input, files;
    function init() {
      function prepareUpload(event) {
        files = event.target.files[0];
        control.setValue(files);
      }

      input = control.getInputs()[0];
      input.bind('change', prepareUpload);
    }
    init();
  };

  return h;
}(hex));

/* global Flow:true,dragula: true*/
var hex = (function (h) {
  'use strict';
  h.widgets.fileupload = function (control, config) {
    var input, url, uploader;
    var dropzone;
    var allowedTypes;
    var limit = 0;
    var single = false;

    var thumbSample;
    var uploaderId;
    var files = [];
    var widget = this;
    widget.loading = false;


    function change() {
      var tmp = [];
      for (var i in files) {
        if (files[i].valid && files[i].id !== undefined) {
          tmp.push(parseInt(files[i].id));
        }
      }
      control.setValue(tmp);
      input.trigger('change');
    }

    function checkLoading() {
      var loading = false;
      for (var i in files) {
        if (files[i].loading === true) {
          loading = true;
          break;
        }
      }
      widget.loading = loading;
    }


    var UpFile = function (upfileConf) {
      var self = this;
      self.id = undefined;
      self.uid = undefined;
      self.thumb = undefined;
      self.url = undefined;
      self.name = undefined;
      self.valid = true;
      self.rid = 0;
      self.loading = false;
      var element;

      function generateRid() {
        var rid = uploaderId;
        if (self.id !== undefined) {
          rid += '_' + self.id;
        }
        if (self.uid !== undefined) {
          rid += '_' + self.uid;
        }
        self.rid = rid;
        element.attr('id', rid);
      }

      function appendParams(params) {
        if (params !== undefined) {
          for (var attr in params) {
            if (self.hasOwnProperty(attr)) {
              self[attr] = params[attr];
            }
          }
        }
        if (self.id === undefined) {
          self.valid = false;
        }
      }

      self.setElement = function (el) {
        element = el;
        element.on('click', 'remove', function (event) {
          event.preventDefault();
          self.remove();
          return false;
        });
        generateRid();
      };


      self.progress = function (p) {
        self.valid = false;
        element.find('p').show().css('width', p + '%');
      };


      self.complete = function (message) {
        self.valid = true;
        self.loading = false;
        appendParams(message);
        element.removeClass('loading');
        var preview = element.find('.upload-preview');
        preview.attr('href', self.url);
        preview.show();
        if (self.thumb !== undefined) {
          preview.html('<img src="' + self.thumb + '"/>');
        }
        element.find('p').hide();
        self.loading = false;
        change();
      };

      self.remove = function (fast) {
        self.valid = false;
        self.loading = false;
        var i = files.indexOf(self);
        if (i >= 0) {
          widget.uploaderRemoveFile(self.uid);
          files.splice(i, 1);
        }
        if (fast === true) {
          element.remove();
        } else {
          element.fadeOut(function () {
            element.remove();
          });
        }
        checkLoading();
        change();

      };

      self.error = function (message) {
        self.valid = false;
        self.loading = false;
        element.find('p').hide();
        element.removeClass('loading');
        message = '! Ошибка:<br/>' + message;
        element.find('.frame').html('<div class="upload-error">' + message + '</div>');
        element.addClass('upfile-error');
        element.removeClass('upfile-new');
        var i = files.indexOf(self);
        if (i >= 0) {
          widget.uploaderRemoveFile(self.uid);
          files.splice(i, 1);
        }
      };

      appendParams(upfileConf);
    };

    widget.uploaderRemoveFile = function (uid) {
      var uploaderFiles = uploader.files;
      for (var i in uploaderFiles) {
        if (uploaderFiles[i].uniqueIdentifier === uid) {
          uploader.removeFile(uploaderFiles[i]);
          break;
        }
      }
    };

    function generateThumb(f, className) {
      var newThumb = thumbSample.clone();
      if (className !== undefined) {
        newThumb.addClass(className);
      }
      newThumb.find('i').attr('title', f.name).html(f.name);
      var preview = newThumb.find('.upload-preview');
      if (f.url !== undefined) {
        preview.attr('href', f.url);
        if (f.thumb !== undefined) {
          preview.html('<img src="' + f.thumb + '"/>');
        }
      } else {
        preview.hide();
      }
      return newThumb.get(0).outerHTML;
    }

    function render() {
      var html = '';
      for (var i in files) {
        html += generateThumb(files[i]);
      }
      dropzone.html(html);
      dropzone.find('thumb').each(function (j) {
        files[j].setElement($(this));
      });
    }

    function add(file) {
      if (single) {
        for (var i in files) {
          files[i].remove(true);
        }
        dropzone.find('thumb').remove();
        change();
      }
      var newFile = new UpFile({'uid': file.uniqueIdentifier, 'name': file.name, 'loading': true});
      var html = generateThumb(newFile, 'upfile-new loading');
      dropzone.append(html);
      newFile.setElement(dropzone.find('thumb:last-child'));
      files.push(newFile);
      newFile.progress(5);
      checkLoading();
    }

    function findFileByUid(uid) {
      var l = files.length;
      for (var i = 0; i <= l; i++) {
        if (files[i].uid === uid) {
          return files[i];
        }
      }
      return false;
    }

    function markError(file, message) {
      var errorFile = findFileByUid(file.uniqueIdentifier);
      if (errorFile !== false) {
        errorFile.error(message);
      }
      checkLoading();
    }


    function complete(file, message) {
      var cFile = findFileByUid(file.uniqueIdentifier);
      if (cFile !== false) {
        cFile.complete(message);
      }
      checkLoading();
    }

    function progress(file) {
      var percent = Math.floor(file.size / 100);
      var p = Math.floor(file.sizeUploaded() / percent);
      var pFile = findFileByUid(file.uniqueIdentifier);
      if (pFile !== false) {
        pFile.progress(p);
      }
    }

    function reorder() {
      var sorted = [];
      dropzone.find('thumb').each(function () {
        var rid = $(this).attr('id');
        for (var i in files) {
          if (files[i].rid === rid) {
            sorted.push(files[i]);
          }
        }
      });

      files = sorted;
      change();
    }

    function init() {
      input = control.getInputs()[0];
      uploaderId = 'u_' + input.attr('id') + '_';
      if (config.types !== undefined) {
        allowedTypes = [];
        var reg = /$[\.]/;
        for (var t in config.types) {
          var type = config.types[t];
          if (!reg.test(type)) {
            type = '.' + type;
          }
          allowedTypes.push(type);
        }

      }
      if (config.single === true) {
        single = true;
      }

      if (config.limit !== undefined) {
        limit = parseInt(config.limit);
        if (isNaN(limit)) {
          limit = 1;
        }
        if (limit === 0) {
          limit = 0;
        }
        delete config.limit;
      }


      if (config.url !== undefined) {
        url = config.url;
      } else {
        throw new Error('doesnt set url paremetr on ' + control.name);
      }


      var flowParams = {
        target: url,
        singleFile: single,
        simultaneousUploads: 5,
        chunkSize: 1 * 512 * 512,
        maxChunkRetries: undefined,
        allowDuplicateUploads: false,
        prioritizeFirstAndLastChunk: true,
        generateUniqueIdentifier: function (file) {
          var ident = 'file_';
          ident += file.size;
          ident += file.name;
          ident += uploaderId;
          ident = h.utils.md5(ident);
          return ident;
        }
      };

      uploader = new Flow(flowParams);
      thumbSample = input.closest('.form-group').find('.upload-dropzone *').first().clone(false);
      input.closest('.form-group').find('.upload-dropzone *').remove();

      dropzone = input.closest('.form-group').find('.upload-dropzone');
      dropzone.on('dragenter', function () {
        $(this).addClass('drag');
      });
      dropzone.on('dragover', function () {
        $(this).addClass('drag');
      });
      dropzone.on('dragend', function () {
        $(this).removeClass('drag');
      });
      dropzone.on('drop', function () {
        $(this).removeClass('drag');
      });
      dropzone.on('mouseout', function () {
        $(this).removeClass('drag');
      });
      dropzone.on('dragleave', function () {
        $(this).removeClass('drag');
      });


      if (limit !== 1) {
        var drake = dragula([dropzone[0]], {
          'mirrorContainer': dropzone.closest('.form-group')[0],
          'direction': 'horizontal',
          'copy': false,
          'copySortSource': false
        });
        drake.on('drop', function () {
          reorder();
        });
      }

      var existFiles = input.data('hexFiles');
      if (existFiles !== undefined) {
        for (var i in existFiles) {
          var existFile = new UpFile(existFiles[i]);
          files.push(existFile);
        }
        render();
      }

      change();
      if (uploader.support) {
        var browseParams = {};
        if (allowedTypes !== undefined) {
          browseParams.accept = allowedTypes.join(',');
        }

        uploader.assignBrowse(input.closest('.form-group').find('[data-upload]')[0], false, single, browseParams);
        uploader.assignDrop(dropzone[0]);
        uploader.on('fileAdded', function (file) {
          var valid = true;
          if (allowedTypes !== undefined) {
            if (allowedTypes.indexOf('.' + file.getType()) < 0) {
              valid = false;
            }
          }
          if (valid) {
            add(file);
          } else {
            add(file);
            markError(file, '"' + file.name + '" - неверный тип файла. Разрешены файлы типа: ' + allowedTypes.join(', '));
          }
          return valid;
        });
        uploader.on('fileSuccess', function (file, message) {
          message = $.parseJSON(message);
          complete(file, message);
        });
        uploader.on('fileError', function (file, message) {
          markError(file, message);
        });
        uploader.on('filesSubmitted', function () {
          uploader.upload();
        });
        uploader.on('fileProgress', function (file) {
          progress(file);
        });
      }

    }

    init();
  };

  return h;
}(hex));

var hex = (function (h) {
  'use strict';
  h.validators.required = function (control, config) {
    var self = this;
    var events = ['blur', 'change', 'keyup'];
    self.weight = 0;
    var name = 'required';

    self.getClassName = function () {
      return name;
    };
    self.setEvents = function (val) {
      events = val;
    };

    self.getEvents = function () {
      return events;
    };

    function init() {
      if (config.events !== undefined) {
        self.setEvents(config.events);
      }
    }

    self.isValid = function (value) {
      if (h.utils.isEmpty(value)) {
        return false;
      } else {
        return true;
      }
    };

    init();
  };

  return h;
}(hex));

var hex = (function (h) {
  'use strict';
  h.validators.email = function (control, config) {
    var self = this;
    var className = 'email';
    self.getClassName = function () {
      return className;
    };
    var events = ['change', 'keyup'];
    var emailPattern = /^\S+[@]\S+\.\S{2,10}$/i;
    self.weight = 1;
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
    self.isValid = function (value) {
      if (h.utils.isEmpty(value)) {
        return true;
      }
      return emailPattern.test(value);
    };
    init();
  };

  return h;
}(hex));

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

var hex = (function (h) {
  'use strict';
  h.validators.stringLength = function (control, config) {
    var self = this;
    var min, max;
    var className = 'string-length';
    self.getClassName = function () {
      return className;
    };
    var events = ['change', 'keyup', 'blur'];
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

var hex = (function (h) {
  'use strict';
  h.validators.passwordConfirm = h.validators.confirm = function (control, config) {
    var self = this;
    var className = 'password-confirm';
    self.getClassName = function () {
      return className;
    };
    var events = ['change', 'keyup', 'blur'];
    self.weight = 4;
    var password;
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
      if (config.password !== undefined) {
        password = $(config.password);
      }
    }

    self.isValid = function (value) {
      return password.val() === value;
    };
    init();
  };

  return h;
}(hex));

/* global Inputmask:true*/
var hex = (function (h) {
  'use strict';
  h.validators.mask = function (control, config) {
    var self = this;
    var input;
    var className = 'mask';
    var events = ['blur'];

    self.getClassName = function () {
      return className;
    };
    self.weight = 4;
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

      input = control.getInputs()[0];

    }

    self.isValid = function (value) {
      if (h.utils.isEmpty(value)) {
        return true;
      }
      var mask = input.inputmask('option', 'mask');
      return Inputmask.isValid(input.val(), {alias: mask});
    };
    init();
  };

  return h;
}(hex));

/* global Inputmask:true*/
var hex = (function (h) {
  'use strict';
  h.validators.phone = function (control, config) {
    var self = this;
    var input;
    var className = 'phone';
    var events = ['blur'];

    self.getClassName = function () {
      return className;
    };
    self.weight = 4;
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

      input = control.getInputs()[0];

    }

    self.isValid = function (value) {
      if (h.utils.isEmpty(value)) {
        return true;
      }
      var mask = input.inputmask('option', 'mask');
      return Inputmask.isValid(input.val(), {alias: mask});
    };
    init();
  };

  return h;
}(hex));

/* global Inputmask:true*/
var hex = (function (h) {
  'use strict';
  h.validators.date = function (control, config) {
    var self = this;
    var events = ['change', 'keyup', 'blur'];
    self.weight = 3;
    var input;
    var className = 'date';

    self.getClassName = function () {
      return className;
    };

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
      input = control.getInputs()[0];
    }

    self.isValid = function (value) {
      if (h.utils.isEmpty(value)) {
        return true;
      }
      var mask = input.inputmask('option', 'mask');
      return Inputmask.isValid(input.val(), {alias: mask});
    };
    init();
  };

  return h;
}(hex));

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

var hex = (function (h) {
  'use strict';

  var hexForms = {};

  function HexForm(formId) {
    var hf = this;
    hf.controls = [];
    hf.errorText = 'Не удалось сохранить форму, попробуйте обновить страницу';
    hf.invalidText = 'Форма содержит ошибки';
    var form = $('#' + formId);
    var handlers = {};
    hf.mainBlock = undefined;

    var FormEvent = function (type) {
      this.type = type;
      this.stoped = false;
      this.stop = function () {
        this.stoped = true;
      };
    };

    hf.removeBlock = function (blockId) {
      var block = hf.mainBlock.findBlockById(blockId);
      if (block === false) {
        return false;
      }
      for (var c in block.controls) {
        var control = block.controls[c];
        var formControl = hf.findControlByName(control.name);
        if (formControl !== false) {
          hf.controls.splice(hf.controls.indexOf(formControl), 1);
        }
      }
      block.controls = [];
      block.element.remove();
      if (block.parent !== undefined) {
        for (var b in block.parent.childBlocks) {
          if (block.parent.childBlocks[b] === block) {
            block.parent.childBlocks.splice(b, 1);
          }
        }
      }
      hf.mainBlock.isValid(false);
    };

    hf.findControlByName = function (cName) {
      for (var i in hf.controls) {
        if (hf.controls[i].name === cName) {
          return hf.controls[i];
        }
      }
      return false;
    };

    hf.on = function (eventName, fn) {
      if (handlers[eventName] === undefined) {
        handlers[eventName] = [];
      }
      if (handlers[eventName].indexOf(fn) < 0) {
        handlers[eventName].push(fn);
      }
    };

    hf.off = function (eventName, fn) {
      if (handlers[eventName] !== undefined) {
        handlers[eventName].splice(handlers[eventName].indexOf(fn), 1);
      }
    };

    hf.fire = function (eventName, params) {
      if (handlers[eventName] !== undefined) {
        var formEvent = new FormEvent(eventName);
        for (var fnIndex in handlers[eventName]) {
          var func = handlers[eventName][fnIndex];
          func(params, formEvent);
        }
        return !formEvent.stoped;
      } else {
        return true;
      }
    };

    hf.getHandlers = function () {
      return handlers;
    };


    var getValues = function () {
      var values = {};
      for (var i in hf.controls) {
        if (hf.controls.hasOwnProperty(i)) {
          if (hf.controls[i].disabled === false) {
            var name = hf.controls[i].name;
            var value = hf.controls[i].getValue();
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
      var dontBreakReset = hf.fire('beforeReset', {values: hf.getValues()});
      if (dontBreakReset) {
        window.setTimeout(function () {
          for (var i in hf.controls) {
            if (hf.controls.hasOwnProperty(i)) {
              hf.controls[i].reset();
            }
          }
          form.find('.has-error').removeClass('has-error');
          form.find('.alerts .alert').remove();
        }, 1);
      } else {
        event.preventDefault();
      }
      hf.fire('afterReset', {});
    };
    var clearErrors = function () {
      form.find('.has-error').removeClass('has-error');
      form.find('.alerts div').remove();
    };

    var submit = function (event) {
      event.preventDefault();
      event.stopPropagation();
      var formValid = hf.mainBlock.isValid();

      if (formValid === true) {
        clearErrors();
        var data = getValues();
        var dontBreakBefore = hf.fire('beforeSubmit', {values: data});
        if (dontBreakBefore) {
          hf.loaderShow();
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
              var dontBreakAfter = hf.fire('afterSubmit', res);
              if (dontBreakAfter) {
                window.setTimeout(function () {
                  if (res.success === true) {
                    clearErrors();
                    if (res.reload !== undefined) {
                      if (res.reload === true) {
                        window.location.href = window.location.href;
                      } else {
                        window.location.href = res.reload;
                      }
                    } else {
                      hf.loaderHide();
                    }
                  } else {
                    hf.loaderHide();
                  }
                  if (res.alerts !== undefined) {
                    for (var m in res.alerts) {
                      var message = res.alerts[m];
                      form.find('.alerts').append($('<div>').addClass('alert alert-' + message.type).html(message.text));
                    }
                    hf.loaderHide();
                  }
                }, 1);
              }
            },
            error: function () {
              hf.loaderHide();
              form.find('.alerts').append($('<div>').addClass('alert alert-danger').html(hf.errorText));
            }
          });
        }
      } else {
        form.find('.alerts div').remove();
        form.find('.alerts').append($('<div>').addClass('alert alert-danger').html(hf.invalidText));
      }
      return false;
    };

    hf.loaderShow = function () {
      form.find('.loader').show();
    };
    hf.loaderHide = function () {
      form.find('.loader').hide();
    };

    hf.submit = function () {
      submit();
    };
    hf.getValues = function () {
      return getValues();
    };

    function hexDisabled(panel) {
      if (panel.parents('[data-hex-multy-item="$"]').size() > 0) {
        return false;
      }


      var currentBlockId = panel.closest('[data-hex-block]').attr('id');
      var currentBlock = hf.mainBlock.findBlockById(currentBlockId);

      var data = panel.data('hexDisabled');

      var searchValue = data.value;
      var control = hf.findControlByName(data.control);
      if (control === undefined) {
        throw new Error('Control "' + data.control + '" not found');
      }
      function onChange() {
        currentBlock.isValid(false);
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

    hf.hexBind = function (block, params) {
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
              var fControl = hf.findControlByName(oldName);
              if (fControl !== false) {
                fControl.name = tpl;
              }
            }

            if (attr === 'id' && n <= 0) {
              console.log('-----------change block.id start-------------');
              var currentBlock = hf.mainBlock.findBlockById(nodes[n].attr('id'));
              console.log(tpl);
              if (currentBlock !== false) {
                currentBlock.id = tpl;
              } else {
                console.log('block not found id:' + nodes[n].attr('id'));
              }
              console.log(currentBlock);
              console.log('=========change block.id=========');
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
    };

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
        hf.hexBind(item, {'@index': newIndex});
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
        var items = block.find('[data-hex-multy-item]');
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


        var pId = block.find('[data-hex-multy-items]').closest('[data-hex-block]').attr('id');
        var parentBlock = hf.mainBlock.findBlockById(pId);
        //Добавляем табы в DOM
        if (tabs !== undefined) {
          var clonedTab = baseTab.clone(false);
          if (block.find('[data-hex-multy-tab]:last').size() > 0) {
            clonedTab.insertAfter(block.find('[data-hex-multy-tab]:last'));
          } else {
            tabs.prepend(clonedTab);
          }
          updateItemIndex(clonedTab, newIndex);
        }

        //Обновляем данные в клонированном блоке
        updateItemIndex(clonedFieldset, newIndex);
        //Добавляем блок в DOM
        clonedFieldset.appendTo(block.find('[data-hex-multy-items]'));

        //Прицепляем блок к дереву блоков
        parentBlock.addBlock(clonedFieldset);


        if (tabs !== undefined) {
          $('a[href="#' + clonedFieldset.attr('id') + '"]').trigger('click');
        }
        //Запускаем hexDisabled
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
          item.fadeOut(500, function () {
            hf.removeBlock(item.attr('id'));
            var items = block.find('[data-hex-multy-item]');
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
            console.log(hf);
          });

        }
      );

      multyCheck();
    }


    var init = function () {
      form.addClass('loader-container').append('<div class="loader"></div>');
      form.attr('data-hex-block', '');
      $(document).on('submit', '#' + formId, submit);
      $(document).on('reset', '#' + formId, reset);
      if (form.find('.loader').size() === 0) {
        form.append('<div class="loader"></div>');
      }

      hf.mainBlock = new h.Block(form, hf);
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
    return hf;
  }

  h.form = function (id) {
    if (id === undefined) {
      var forms = $('form.hex-form');
      forms.each(function () {
        var formId = $(this).attr('id');
        if (formId === undefined) {
          throw new Error('Form dont have id attr');
        } else {
          if (hexForms[formId] === undefined) {
            hexForms[formId] = new HexForm(formId);
          }
        }
      });
    } else {
      if (hexForms[id] === undefined) {
        hexForms[id] = new HexForm(id);
      }
      return hexForms[id];
    }
    return hexForms;
  };

  $(document).ready(function () {

    h.form();
  });

  return h;
}(hex));

