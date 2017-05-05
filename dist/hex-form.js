var hex = (function () {
  'use strict';
  var h = {'widgets': {}, 'validators': {}, 'directives': {}, 'utils': {}};

  h.utils.toCamel = function (string) {
    return string.replace(/[-_]([a-z])/g, function (g) {
      return g[1].toUpperCase();
    });
  };

  h.utils.isInt = function (value) {
    return !isNaN(value) && (function (x) {
        return (x | 0) === x;
      })(parseFloat(value));
  };

  h.utils.arrayUniq = function (a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for (var i = 0; i < len; i++) {
      var item = a[i];
      if (seen[item] !== 1) {
        seen[item] = 1;
        out[j++] = item;
      }
    }
    return out;
  };

  h.utils.exprToFunc = function (expr) {
    //TODO добавить пробелы к операторам _+_
    var exprFilters = expr.split('##');
    expr = exprFilters[0];

    expr = expr.replace(/\[['"]/g, '.').replace(/['"]]/g, '').replace(/\[(\D+)]/, '.$1');
    var re = /([a-z_$][a-z_$.0-9\[\]'"]+)/gi;
    var vars = [];
    var variables = expr.replace(/'[^']*'/g, '').replace(/"[^"]*"/g, '').match(re);

    for (var v = 0, vl = variables.length; v < vl; v++) {
      var variable = variables[v];
      if (variable !== '' && variable !== 'undefined') {
        var variableCan = variable.replace(/['"]/gi, '').replace(/\[/g, '.').replace(/]/g, '').replace(/\.+/g, '.').replace(/^\./, '').replace(/\.$/, '');
        variableCan = '[\'' + variableCan.split('.').join('\'][\'') + '\']';
        if (vars.indexOf(variableCan) === -1) {
          vars.push(variableCan);
          var r = '[^a-z0-9_\\[\\]\\+\\=\\-\\|\\&\\!\\/\\*\\"\'\\040]*';
          r += variable.replace(/#/g, '\\#').replace(/\$/g, '\\$').replace(/\./g, '\\.').replace(/\[/g, '\\[').replace(/]/g, '\\]');
          r += '[^a-z0-9_\\[\\]\\+\\=\\-\\|\\&\\!\\/\\*\\"\'\\040]*';
          var regexp = new RegExp(r, 'g');
          expr = expr.replace(regexp, '__data' + variableCan);
        }
      }
    }
    if (exprFilters.length > 1) {
      for (var i = 1; i < exprFilters.length; i++) {
        expr = exprFilters[i] + '(' + expr + ')';
      }
    }

    var funcBody = 'var r="";try{var r=' + expr + ';}catch (e){console.warn(e);return "error"};return r;';
    return {'vars': vars, 'func': funcBody};
  };


  h.utils.objectExtend = function (originalObject, newObject) {
    if (newObject === undefined) {
      newObject = {};
    }
    for (var o in originalObject) {
      if ($.isArray(originalObject[o]) || $.isPlainObject(originalObject[o])) {
        h.utils.objectExtend(originalObject[o], newObject[o]);
      } else {
        if (newObject[o] === undefined) {
          //originalObject[o] = undefined;
        } else {
          if ($.isArray(originalObject)) {
            originalObject.push(newObject);
          } else {
            originalObject[o] = newObject[o];
          }
        }
      }
    }

    for (var a in newObject) {
      if (JSON.stringify(originalObject[a]) !== JSON.stringify(newObject[a])) {
        if ($.isArray(newObject[a])) {
          if (originalObject[a] === undefined) {
            originalObject[a] = [];
          }
          h.utils.objectExtend(originalObject[a], newObject[a]);
        } else if ($.isPlainObject(newObject[a])) {
          if (originalObject[a] === undefined) {
            originalObject[a] = {};
          }
          h.utils.objectExtend(originalObject[a], newObject[a]);
        } else {
          originalObject[a] = newObject[a];
        }
      }
    }
  };


  h.utils.objectProperty = function (obj, name, value) {
    if (h.utils.isEmpty(name)) {
      return obj;
    }
    var names = name.replace(/['"]/g, '').replace(/[\[\]]/g, '.').replace(/\.+/g, '.').replace(/\.$/, '').split('.');
    var nml = names.length - 1;
    var cObj = obj;

    if (value !== undefined) {
      for (var i = 0; i <= nml; i++) {
        var aName = names[i];
        if (aName !== '') {
          if (i < nml) {
            if (cObj === '') {
              cObj = {};
            }
            if (cObj[aName] === undefined) {
              if (h.utils.isInt(aName)) {
                cObj[aName] = [];
              } else {
                cObj[aName] = {};
              }
            }
            cObj = cObj[aName];
          } else {
            cObj[aName] = value;
          }
        }
      }
    } else {
      for (var j = 0; j <= nml; j++) {
        var aN = names[j];
        if (aN !== '') {
          if (j < nml) {
            if (cObj[aN] === undefined) {
              return undefined;
            }
            cObj = cObj[aN];
          } else {
            if (h.utils.isEmpty(cObj)) {
              return undefined;
            }
            return cObj[aN];
          }
        }
      }
    }
  };

  //Пустая переменная или нет
  h.utils.isEmpty = function (v) {
    return !!(v === null || v === false || v === undefined || v === '' || ($.isArray(v) && v.length === 0));
  };

  //Возвращает массив атрибутов узла
  h.utils.getAttributes = function (node) {
    var map = {};
    var attributes = node[0].attributes;
    var aLength = attributes.length;
    for (var a = 0; a < aLength; a++) {
      map[attributes[a].name.toLowerCase()] = attributes[a].value;
    }
    return map;
  };

  //Строка в md5
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
      var lWordArray = new Array(lNumberOfWords - 1);
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
  return h;
})();


var hex = (function (h) {
    'use strict';
    h.directives.Bind = function (config) {

      var node, attribute, func, variables = [];

      function render(data) {
        data = h.utils.objectProperty(data, config.block.namespaceFull);

        if (data === undefined) {
          data = {};
        }
        switch (attribute) {
          case 'html':
          {
            node.get(0).innerHTML = func(data);
            break;
          }
          case 'id':
          {
            var r = func(data);
            node.attr(attribute, func(data));
          }
          default:
          {
            node.attr(attribute, func(data));
            if (/^data-/.test(attribute)) {
              var dataOption = attribute.replace('data-', '');
              node.data(dataOption, func(data));
              node.attr(attribute, func(data));
            }
          }
        }
      }


      var directive = {
        render: render,
        type: 'bind'
      };

      Object.defineProperty(directive, 'variables', {
        enumerable: true,
        configurable: true,
        get: function () {
          return variables.map(function (d) {
            return config.block.namespaceFull + d;
          });
        },
        set: function () {

        }
      });


      function init() {
        node = config.node;
        directive.node = node;
        var expr = node.attr(config.attribute);
        attribute = config.attribute.replace('data-hex-bind-', '');


        var f = h.utils.exprToFunc(expr);
        for (var i = 0, l = f.vars.length; i < l; i++) {
          variables.push(f.vars[i]);
        }
        func = new Function('__data', f.func);
      }

      init();
      return directive;
    };

    return h;
  }(hex)
);

var hex = (function (h) {
  'use strict';
  h.directives.Show = function (config) {

    var node, func, variables = [];

    function render(data) {
      data = h.utils.objectProperty(data, config.block.namespaceFull);
      var r = false;
      if (!h.utils.isEmpty(data)) {
        r = func.call(null, data);
      }
      if (r) {
        node.removeClass('hide');
      } else {
        node.addClass('hide');
      }
    }


    var directive = {
      render: render,
      type: 'show'
    };

    Object.defineProperty(directive, 'variables', {
      enumerable: true,
      configurable: true,
      get: function () {
        return variables.map(function (d) {
          return config.block.namespaceFull + d;
        });
      },
      set: function () {

      }
    });

    function init() {
      node = $(config.node);
      node.addClass('hide');
      var expr = node.attr('data-hex-show');
      var f = h.utils.exprToFunc(expr);
      for (var i = 0, l = f.vars.length; i < l; i++) {
        variables.push(f.vars[i]);
      }

      func = new Function('__data', f.func);
    }

    init();
    return directive;
  };

  return h;
}(hex));

var hex = (function (h) {
    'use strict';
    h.directives.If = function (config) {
      var node, func, comment, template, block, variables = [];

      function render(data) {
        data = h.utils.objectProperty(data, config.block.namespaceFull);
        var result = false;
        if (data !== undefined) {
          result = func.call(null, data);
        }
        if (result === true) {
          if (node === undefined) {
            node = template.clone(false);
            node.insertAfter(comment);
            block.addBlock(node);
          }
        } else {
          if (node !== undefined) {
            if (node.get(0).getBlock !== undefined) {
              node.get(0).getBlock().remove();
              node = undefined;
            } else {
              node.hide();
            }
          }
        }

      }


      var directive = {
        render: render,
        type: 'if'
      };

      Object.defineProperty(directive, 'variables', {
        enumerable: true,
        configurable: true,
        get: function () {
          return variables.map(function (d) {
            return config.block.namespaceFull + d;
          });
        },
        set: function () {

        }
      });

      function init() {
        node = config.node;
        directive.node = node;
        template = node.clone(false);
        template.attr('data-hex-block', '');
        var expr = node.attr('data-hex-if');
        block = config.block;

        var f = h.utils.exprToFunc(expr);
        for (var i = 0, l = f.vars.length; i < l; i++) {
          variables.push(f.vars[i]);
        }
        func = new Function('__data', f.func);
        comment = $(document.createComment('* hex-if *'));
        comment.insertBefore(node.get(0));
        template.removeAttr('data-hex-if');
        node.remove();
        node = undefined;
      }


      init();
      return directive;
    };

    return h;
  }(hex)
);

var hex = (function (h) {
    'use strict';
    h.directives.Disable = function (config) {
      var node, func, variables = [], block = false;

      function render(data) {
        data = h.utils.objectProperty(data, config.block.namespaceFull);
        var result = func.call(null, data);
        var controls = node.find('input[type!="submit"],select,textarea,button').addBack('input[type!="submit"],select,textarea,button');
        if (result) {
          controls.each(function () {
            if (block === false) {
              $(this).prop('disabled', true);
              $(this).trigger('disable');
            } else {
              block.disable();
            }
          });
        } else {
          controls.each(function () {
            if (block === false) {
              $(this).prop('disabled', false);
              $(this).trigger('enable');
            } else {
              block.enable();
            }
          });
        }
      }


      var directive = {
        render: render,
        type: 'disable'
      };

      Object.defineProperty(directive, 'variables', {
        enumerable: true,
        configurable: true,
        get: function () {
          return variables.map(function (d) {
            return config.block.namespaceFull + d;
          });
        },
        set: function () {

        }
      });


      function init() {
        node = config.node;
        if (typeof node.get(0).getBlock === 'function') {
          block = node.get(0).getBlock();
        }

        var expr = node.attr('data-hex-disable');
        var f = h.utils.exprToFunc(expr);
        for (var i = 0, l = f.vars.length; i < l; i++) {
          variables.push(f.vars[i]);
        }
        func = new Function('__data', f.func);
      }

      init();
      return directive;
    };

    return h;
  }(hex)
);

var hex = (function (h) {
  'use strict';
  h.directives.List = function (config) {


    var
      node,//DOM node
      template,//Шаблон
      namespace,
      listData,
      variables = [],
      block,
      allowEmpty = false,
      itemSelector = '[data-hex-block]',
      handlers = {}//привязанные к контролу события
      ;

    function getNamespace() {
      return namespace;
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


    function add() {
      var newItem = template.clone(false);
      newItem.attr('data-hex-block', namespace);
      if (node.children(itemSelector).size() > 0) {
        newItem.insertAfter(node.children(itemSelector).last());
      } else {
        node.prepend(newItem);
      }

      var newBlock = block.addBlock(newItem);
      trigger('add', newItem);
      block.render.draw();
      return newBlock;
    }

    function remove(index) {
      if (!allowEmpty) {
        if (node.children(itemSelector).size() === 1) {
          return false;
        }
      }
      var ind = index + 1;
      var removed = node.children(itemSelector + ':nth-child(' + ind + ')').first();
      if (removed.size() > 0) {
        removed.get(0).getBlock().remove();
      }
      node.children(itemSelector).each(function (indx) {
        var nBlock = $(this).get(0).getBlock();
        var data = nBlock.getData();

        data.$index = indx;
        if (nBlock.childBlocks.length > 0) {
          for (var i = 0, len = nBlock.childBlocks.length; i < len; i++) {
            nBlock.childBlocks[i].getData().$parentIndex = indx;
          }
        }
        $(this).get(0).getBlock().render.draw();
      });
      trigger('remove', index);
    }

    function render() {
      var currentItems = node.children(itemSelector);

      //изменения в списке
      var removed = -1;

      //Удаление старых
      currentItems.each(function (k) {
        var itemData = $(this).get(0).getBlock().getData();
        var dIndex = listData.indexOf(itemData);
        if (dIndex === -1 || itemData === undefined) {
          $(this).get(0).getBlock().remove();
          removed = k;
        }
      });
      currentItems = node.children(itemSelector);

      //Добавление новых
      for (var n in listData) {
        if (!h.utils.isEmpty((listData[n]))) {
          var finded = false;
          for (var j = 0, jl = currentItems.length; j < jl; j++) {
            if (currentItems[j].getBlock().getData() === listData[n]) {
              finded = true;
            }
          }
          if (!finded) {
            add();
            currentItems = node.children(itemSelector);
          }
        }
      }


      /*
       var currentItems = node.children(itemSelector);

       currentItems.each(function (j) {
       var currentIndex=$(this).get(0).getBlock().getData().$index;
       if (currentIndex!== j) {
       console.info('!=');
       $(this).insertBefore(node.children(itemSelector + ':nth-child(' + currentIndex+ ')').first());
       }
       });
       */
      if (removed > -1) {
        trigger('remove', removed);
      }

    }


    var directive = {
      type: 'list',
      getNamespace: getNamespace,
      render: render,
      on: on,
      off: off,
      trigger: trigger,
      add: add,
      remove: remove
    };


    Object.defineProperty(directive, 'variables', {
      enumerable: true,
      configurable: true,
      get: function () {
        return variables.map(function (d) {
          return config.block.namespaceFull + d;
        });
      },
      set: function () {

      }
    });

    function init() {
      node = $(config.node);
      block = config.block;
      namespace = node.attr('data-hex-list');
      if (namespace === undefined) {
        console.warn('list don`t have namespace');
      }

      var blockData = config.block.getData();
      if (blockData[namespace] === undefined) {
        h.utils.objectProperty(blockData, namespace, []);
      }

      listData = blockData[namespace];

      if (node.attr('data-hex-list-allowempty') !== undefined) {
        allowEmpty = true;
      }
      itemSelector = '[data-hex-block="' + namespace + '"]';
      template = node.children('[data-hex-list-tpl]').first().clone(false).removeAttr('data-hex-list-tpl');
      node.children('[data-hex-list-tpl]').first().remove();

      if (template.find('a[data-toggle="tab"]').size() > 0) {
        on('add', function (newNode) {
          window.setTimeout(function () {
            newNode.find('a[data-toggle="tab"]').click();
          }, 1);
        });
        on('remove', function (index) {
          var ind = index + 1;
          window.setTimeout(function () {
            var next = node.find(itemSelector + ':nth-child(' + ind + ')').first();
            if (next.size() > 0) {
              next.find('a[data-toggle="tab"]').click();
            } else {
              ind--;
              var prev = node.find(itemSelector + ':nth-child(' + ind + ')').first();
              if (prev.size() > 0) {
                prev.find('a[data-toggle="tab"]').click();
              }
            }
          }, 1);
        });
      }
      variables.push('[\'' + namespace + '\']');
    }

    init();
    return directive;
  };

  return h;
}(hex));

var hex = (function (h) {
  'use strict';
  h.directives.ListAdd = function (config) {


    var
      node//DOM node
      , namespace
      , handlers = {}//привязанные к контролу события
      , item = {}
      ;

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

    var directive = {
      on: on,
      off: off,
      trigger: trigger
    };

    function init(conf) {
      node = $(conf.node);
      namespace = node.attr('data-hex-list-add');

      if (node.attr('data-hex-list-add-item') !== undefined) {
        item = JSON.parse(node.attr('data-hex-list-add-item'));
      }

      node.on('click', function (event) {
        event.preventDefault();
        trigger('add', {namespace: namespace, item: item});
      });
    }


    init(config);
    return directive;
  };

  return h;
}(hex));

var hex = (function (h) {
  'use strict';
  h.directives.ListRemove = function (config) {


    var
      node//DOM node
      , handlers = {}//привязанные к контролу события
      , namespace
      , variables = []
      , allowEmpty = false
      ;


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

    function render(data) {
      if (!allowEmpty) {
        var list = h.utils.objectProperty(data, config.block.parent.namespaceFull + namespace);
        var length = 0;
        if (!h.utils.isEmpty(list)) {
          length = list.length;
        }
        if (length < 2) {
          node.prop('disabled', true);
        } else {
          node.prop('disabled', false);
        }
      }
    }

    var directive = {
      render: render,
      on: on,
      off: off,
      trigger: trigger
    };

    Object.defineProperty(directive, 'variables', {
      enumerable: true,
      configurable: true,
      get: function () {
        return variables.map(function (d) {
          return config.block.parent.namespaceFull + d;
        });
      },
      set: function () {

      }
    });

    function init(conf) {
      node = $(conf.node);
      namespace = node.closest('[data-hex-list]').attr('data-hex-list');
      if (node.closest('[data-hex-list]').attr('data-hex-list-allowempty') !== undefined) {
        allowEmpty = true;
      }

      variables.push('[\'' + namespace + '\']');

      node.on('click', function (event) {
        event.preventDefault();
        var data = $(this).closest('[data-hex-block]').get(0).getBlock().getData();
        trigger('remove', {
          namespace: namespace,
          data: data
        });
      });
    }


    init(config);
    return directive;
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
      if (config.templateSelection !== undefined) {
        config.templateSelection = window[config.templateSelection];
      }
      if (config.templateResult !== undefined) {
        config.templateResult = window[config.templateResult];
      }
      var placeholder = config.placeholder || '';
      var defaultSettings = {
        theme: 'bootstrap',
        allowClear: true,
        placeholder: placeholder,
        minimumResultsForSearch: 10
      };

      if (config.data !== undefined) {
        var dParams = config.data.split('::');
        var ns = dParams[0];
        var dataObj = input.closest('[data-hex-block]').get(0).getBlock().getData();
        if (dParams[1] !== undefined) {
          var filter = window[dParams[1]];
          config.data = filter(h.utils.objectProperty(dataObj, ns));
        } else {
          config.data = h.utils.objectProperty(dataObj, ns);
        }


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
    var input;

    function prepareUpload(event) {
      control.setValue(event.target.files[0]);
    }

    function init() {
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


      if (!single) {
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
    var events = ['blur', 'change'];
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
      return !h.utils.isEmpty(value);
    };
    if (config !== undefined) {
      init();
    }
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
    var events = ['blur'];
    var emailPattern = /^\S+[@]\S+\.\S{2,10}$/im;
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

    var lastValidValue, lastInValidValue = false;
    var url;
    var ajax = false;
    var events = ['blur', 'change', 'unique'];
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


      if (h.utils.isEmpty(value) || value === lastValidValue) {
        return true;
      } else {
        if (value === lastInValidValue) {
          return false;
        } else {
          ajax = $.ajax({
            'url': url,
            'data': {'value': value},
            'method': 'POST',
            'async': true,
            'success': function (data) {
              if (data.success === true) {
                lastValidValue = value;
                control.validate(true, 'unique');
              } else {
                lastInValidValue = value;
                control.validate(true, 'unique');
              }
            }
          });
          return true;
        }
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
    var events = ['change', 'blur'];
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

      if (h.utils.isEmpty(string)) {
        return true;
      }

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

var hex = (function (h) {
  'use strict';
  h.validators.passwordConfirm = h.validators.confirm = function (control, config) {
    var self = this;
    var className = 'password-confirm';
    self.getClassName = function () {
      return className;
    };
    var events = ['change', 'blur'];
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
    var events = ['change', 'blur'];
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
    h.Render = function () {
      var directives = [];


      var data = {};
      var dataLastVersion = {};
      var linkedVars = [];

      function getLinkedVariables() {
        linkedVars = [];
        for (var i = 0, length = directives.length; i < length; i++) {
          for (var j = 0, jl = directives[i].variables.length; j < jl; j++) {
            if (linkedVars.indexOf(directives[i].variables[j]) === -1) {
              linkedVars.push(directives[i].variables[j]);
            }
          }
        }
        linkedVars = h.utils.arrayUniq(linkedVars);
        return linkedVars;
      }

      function clear() {
        linkedVars = [];
        dataLastVersion = {};
      }

      function addDirective(d) {
        if (directives.indexOf(d) === -1) {
          directives.push(d);
          for (var j = 0, jl = d.variables.length; j < jl; j++) {
            if (linkedVars.indexOf(d.variables[j]) === -1) {
              linkedVars.push(d.variables[j]);
            }
          }
        }
      }

      function removeDirective(d) {
        if (directives.indexOf(d) >= 0) {
          /*
           d.variables.forEach(function (v) {
           if (dataLastVersion[v] !== undefined) {
           delete dataLastVersion[v];
           }
           if (linkedVars !== undefined) {
           if (linkedVars.indexOf(v) !== -1) {
           linkedVars.splice(linkedVars.indexOf(v), 1);
           }
           }
           });
           */
          directives.splice(directives.indexOf(d), 1);
          clear();
        }
      }

      function draw(renderDirectives) {

        var changedVars = [];

        var localData = JSON.parse(JSON.stringify(data));

        localData.trololo = '1456';
        if (linkedVars.length === 0) {
          linkedVars = getLinkedVariables();
        }


        for (var i = 0, length = linkedVars.length; i < length; i++) {
          var paramAsString = linkedVars[i];
          var value = h.utils.objectProperty(localData, paramAsString);

          if (value === undefined) {
            value = '';
          }

          h.utils.objectProperty(localData, paramAsString, value);

          if (JSON.stringify(value) !== dataLastVersion[paramAsString]) {
            changedVars.push(paramAsString);
          }
        }


        if (changedVars !== undefined && changedVars.length > 0) {
          var activeDirectives = renderDirectives;
          if (renderDirectives === undefined) {
            activeDirectives = directives.filter(function (bind) {
              for (i = 0, length = changedVars.length; i < length; i++) {
                if (bind.variables.indexOf(changedVars[i]) >= 0) {
                  return true;
                }
              }
              return false;
            });
          }

          for (i = 0; i < activeDirectives.length; i++) {
            activeDirectives[i].render(localData);
          }
          //Сохраняем последние изменения данных
          for (i = 0, length = changedVars.length; i < length; i++) {
            dataLastVersion[changedVars[i]] = JSON.stringify(h.utils.objectProperty(data, changedVars[i]));
          }
        }
      }

      var render = {
        directives: directives,
        removeDirective: removeDirective,
        addDirective: addDirective,
        data: data,
        draw: draw,
        clear: clear
      };

      return render;
    };
    return h;
  }(hex)
);


var hex = (function (h) {
  'use strict';
  h.Block = function (node, parentBlock) {
    var
      isValid = true; //Валиден блок или нет
    var blockId = false;
    var directives = [];
    var blockData = {};
    var childBlocks = [];
    var namespace = '';
    var controls = [];
    var render;
    var root;

    var $index;
    var isRoot = false;
    var lists = {};
    var listAdd = [];
    var listUp = [];
    var listRemove = [];

    function getId() {
      return blockId;
    }


    function getLists(ns) {
      if (ns === undefined) {
        return lists;
      } else {
        return lists[ns];
      }
    }

    function logErrors() {
      for (var i = 0, il = controls.length; i < il; i++) {
        if (!controls[i].validate(true)) {
          console.warn(controls[i].getName());
        }
      }
      for (i = 0, il = childBlocks.length; i < il; i++) {
        childBlocks[i].logErrors();
      }
    }

    function listAddItem(params) {
      blockData[params.namespace].push({});
      render.draw();
    }

    function listRemoveItem(params) {
      var parentData = parentBlock.getData()[params.namespace];
      var index = parentData.indexOf(params.data);
      if (index !== -1) {
        parentData.splice(index, 1);
        render.clear();
        render.draw();
      }
    }

    function listUpItem(params) {
      var parentData = parentBlock.getData()[params.namespace];
      var index = parentData.indexOf(params.data);
      if (index > 0) {
        var from = index;
        var to = index - 1;
        parentData.splice(to, 0, parentData.splice(from, 1)[0]);
      }
      for (var i = index + 1, l = parentData.length; i < l; i++) {
        parentData[i].$index = i;
      }

      render.draw();
    }

    //Поиск связей внутри блока
    function initDirectives(currentBlock) {
      var s = '[data-hex-bind-html],[data-hex-bind-for],[data-hex-bind-class],[data-hex-bind-data-content],[data-hex-bind-id],[data-hex-bind-href],[data-hex-disable],[data-hex-bind-name],[data-hex-bind-src],[data-hex-show],[data-hex-hide],[data-hex-list],[data-hex-list-add],[data-hex-list-remove],[data-hex-list-up],[data-hex-if],[data-hex-data]';
      var bindNodes = currentBlock.node.find(s).addBack();

      bindNodes.each(function () {
        var findedNode = $(this);
        //Проверка того, что найденные элементы лежат непосредственно внутри нашего блока

        if (findedNode.parents('[data-hex-if]').size() === 0 && findedNode.closest('[data-hex-list-tpl]').size() === 0 && (findedNode.closest('[data-hex-block]').first().get(0) === currentBlock.node.get(0) || findedNode.get(0) === currentBlock.node.get(0))) {
          var attributes = h.utils.getAttributes(findedNode);
          for (var a in attributes) {
            if (attributes.hasOwnProperty(a)) {
              switch (a) {
                case 'data-hex-bind-html':
                case 'data-hex-bind-css':
                case 'data-hex-bind-name':
                case 'data-hex-bind-href':
                case 'data-hex-bind-src':
                case 'data-hex-bind-id':
                case 'data-hex-bind-for':
                case 'data-hex-bind-data-content':
                case 'data-hex-bind-class':
                {
                  directives.push(new h.directives.Bind({
                    node: findedNode,
                    attribute: a,
                    block: currentBlock
                  }));
                  break;
                }
                case 'data-hex-show':
                {
                  directives.push(new h.directives.Show({node: findedNode, block: currentBlock}));
                  break;
                }
                case 'data-hex-data':
                {
                  directives.push(new h.directives.Data({node: findedNode, block: currentBlock}));
                  break;
                }
                case 'data-hex-if':
                {
                  directives.push(new h.directives.If({
                    node: findedNode,
                    block: currentBlock
                  }));
                  break;
                }
                case 'data-hex-disable':
                {
                  directives.push(new h.directives.Disable({
                    node: findedNode,
                    block: currentBlock
                  }));
                  break;
                }
                case 'data-hex-list':
                {
                  var list = new h.directives.List({
                    node: findedNode,
                    block: currentBlock
                  });

                  if (lists[list.getNamespace()] === undefined) {
                    lists[list.getNamespace()] = [];
                  }
                  lists[list.getNamespace()].push(list);
                  directives.push(list);
                  break;
                }
                case 'data-hex-list-add':
                {
                  var listAddNew = new h.directives.ListAdd({node: findedNode});
                  listAddNew.on('add', listAddItem);
                  listAdd.push(listAddNew);
                  break;
                }
                case 'data-hex-list-remove':
                {
                  var listRemoveNew = new h.directives.ListRemove({node: findedNode, block: currentBlock});
                  listRemoveNew.on('remove', listRemoveItem);
                  directives.push(listRemoveNew);
                  break;
                }
                case 'data-hex-list-up':
                {
                  var listUpNew = new h.directives.ListUp({node: findedNode});
                  listUpNew.on('up', listUpItem);
                  listUp.push(listUpNew);
                  break;
                }
              }
            }
          }

          for (var d = 0, dl = directives.length; d < dl; d++) {
            render.addDirective(directives[d]);
          }
        }
      });

    }

    function disable() {

      for (var i = 0, il = controls.length; i < il; i++) {
        controls[i].disable();
      }
    }

    function enable() {
      for (var i = 0, il = controls.length; i < il; i++) {
        controls[i].enable();
      }
    }

    function setData(data) {
      h.utils.objectExtend(blockData, data);
    }

    function getData() {
      return blockData;
    }


    function validate(update) {
      var blockValid = true;
      for (var i = 0, il = controls.length; i < il; i++) {
        if (!controls[i].validate(update)) {
          blockValid = false;
        }
      }
      for (i = 0, il = childBlocks.length; i < il; i++) {
        if (!childBlocks[i].validate(update)) {
          blockValid = false;
        }
      }
      isValid = blockValid;
      return isValid;
    }


    function reset() {
      isValid = true;
      for (var i = 0, il = controls.length; i < il; i++) {
        controls[i].reset();
      }
      for (i = 0, il = childBlocks.length; i < il; i++) {
        childBlocks[i].reset();
      }
      render.draw();
    }


    function removeControl(control) {

      var controlName = control.getName();
      var names = controlName.replace(/['"]/g, '').replace(/[\[\]]/g, '.').replace(/\.+/g, '.').replace(/\.$/, '').replace(/^\./, '').split('.');
      var nml = names.length - 1;

      var cObj = blockData;
      for (var i = 0; i <= nml; i++) {
        var aName = names[i];

        if (i < nml) {
          if (cObj[aName] !== undefined) {
            cObj = cObj[aName];
          }
        } else {

          if (cObj[aName] !== undefined) {
            if ($.isArray(cObj)) {
              cObj.splice(aName, 1);
            } else {
              delete cObj[aName];
            }
          }
        }
      }
      var index = controls.indexOf(control);
      if (index !== -1) {
        controls.splice(index, 1);
      }

    }

    function addControl(control) {
      var cObj = blockData;
      var controlName = control.getName();
      var names = controlName.replace(/['"]/g, '').replace(/[\[\]]/g, '.').replace(/\.+/g, '.').replace(/\.$/, '').split('.').filter(function (n) {
        return !h.utils.isEmpty(n);
      });
      var nml = names.length - 1;
      var defaultVal = hex.utils.objectProperty(blockData, controlName);
      if (!h.utils.isEmpty(defaultVal)) {
        control.setValue(defaultVal);
      }

      for (var i = 0; i <= nml; i++) {
        var aName = names[i];
        if (i < nml) {
          if (h.utils.isEmpty(cObj[aName]) || typeof cObj[aName] !== 'object') {
            cObj[aName] = {};
          }
          cObj = cObj[aName];
        } else {
          Object.defineProperty(cObj, aName, {
            enumerable: true,
            configurable: true,
            get: control.getValue,
            set: control.setValue
          });
        }
      }


      control.on('change', function () {
        //h.utils.objectProperty(blockData, controlName, value);
        render.draw();
      });


      control.on('disable', function () {

      });
      control.on('enable', function () {

      });


      control.on('validate', function () {
        root.validate(false);
        render.draw();
      });
    }

    //Добавляем контролы в блок
    function addControls(newInputs, currentBlock) {
      var tmpConfigs = {};
      for (var i in newInputs) {
        var input = newInputs[i];

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
          block: currentBlock,
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

      for (var cName in tmpConfigs) {
        if (tmpConfigs.hasOwnProperty(cName)) {
          controls.push(new hex.Control(tmpConfigs[cName]));
        }
      }

      for (var c = 0, len = controls.length; c < len; c++) {
        addControl(controls[c]);
      }

    }


    var block = {
      controls: controls,
      parent: parentBlock,
      childBlocks: childBlocks,
      $hexBlock: true,
      validate: validate,
      reset: reset,
      getId: getId,
      getLists: getLists,
      setData: setData,
      getData: getData,
      disable: disable,
      enable: enable,
      directives: directives,
      logErrors: logErrors
    };

    block.addBlock = function (newBlock) {
      if (newBlock.$hexBlock === undefined) {
        newBlock = new h.Block(newBlock, block);
      }
      var index = childBlocks.indexOf(newBlock);
      if (index === -1) {
        childBlocks.push(newBlock);
        return newBlock;
      } else {
        return childBlocks[index];
      }
    };

    block.remove = function () {
      //Убираем контролы и их привязки к данным
      while (block.controls.length > 0) {
        removeControl(block.controls[0]);
      }

      //Убираем директивы
      for (var i = 0, l = directives.length; i < l; i++) {
        render.removeDirective(directives[i]);
      }

      if (!h.utils.isEmpty(parentBlock)) {
        if (!h.utils.isEmpty(namespace)) {
          var parentData = parentBlock.getData()[namespace];
          if (parentData !== undefined) {
            if (parentData === blockData) {
              delete parentBlock.getData()[namespace];
            } else {
              if ($.isArray(parentData)) {
                var dIndex = parentData.indexOf(blockData);
                if (dIndex !== undefined && dIndex !== -1) {
                  parentData.splice(dIndex, 1);
                }
              }
            }
          }
        }
        var bIndex = parentBlock.childBlocks.indexOf(block);
        if (bIndex !== -1) {
          parentBlock.childBlocks.splice(bIndex, 1);
        }
      }

      while (block.childBlocks.length > 0) {
        block.childBlocks[0].remove();
      }
      node.remove();
      root.validate(false);
    };


    function findChildrenBlocks(currentBlock) {
      var ownInputs = [];
      //Находим все инпуты внутри блока
      currentBlock.node.find('input[type!="submit"],select,textarea').each(function () {
        var el = $(this);
        var parentBlockNode = el.closest('[data-hex-block]');
        //Инпут находится непосредственно внутри нашего блока не в шаблоне и не в hex-if
        if (el.closest('[data-hex-list-tpl]').size() === 0 && el.closest('[data-hex-if]').size() === 0 && parentBlockNode.get(0) === node.get(0)) {
          ownInputs.push(el);
        }
      });
      addControls(ownInputs, currentBlock);

      currentBlock.node.find('[data-hex-block]').each(function () {
        var el = $(this);
        if (el.closest('[data-hex-list-tpl]').size() === 0 && el.closest('[data-hex-if]').size() === 0 && (el.parents('[data-hex-block]:first').get(0) === currentBlock.node.get(0))) {
          currentBlock.addBlock(el);
        }
      });

    }


    function initBlock() {
      block.node = node;

      node.get(0).getBlock = function () {
        return block;
      };

      if (!h.utils.isEmpty(parentBlock)) {
        root = parentBlock.root;
        render = block.render = parentBlock.render;
        isRoot = false;
      } else {
        root = block;
        parentBlock = false;
        block.parent = undefined;
        isRoot = true;
        render = block.render = new h.Render();
        blockData = render.data;
        block.namespaceFull = '';
      }
      block.root = root;


      if (!h.utils.isEmpty(node.attr('data-hex-block'))) {
        namespace = node.attr('data-hex-block');
        $index = undefined;
        if (node.closest('[data-hex-list="' + namespace + '"]').size() > 0) {
          $index = node.closest('[data-hex-list="' + namespace + '"]').children('[data-hex-block="' + namespace + '"]').index(node);
        }
      }

      if (!isRoot) {
        if (h.utils.isEmpty(namespace)) {
          blockData = parentBlock.getData();
          Object.defineProperty(block, 'namespaceFull', {
            enumerable: true,
            configurable: true,
            get: function () {
              return parentBlock.namespaceFull;
            },
            set: function () {

            }
          });
        } else {
          //Если блок внутри списка
          if ($index !== undefined) {
            var bd = parentBlock.getData();
            if (bd !== undefined) {
              bd = bd[namespace];
              if (bd[$index] === undefined) {
                bd[$index] = blockData;
              } else {
                blockData = bd[$index];
              }
            }

            Object.defineProperty(blockData, '$index', {
              enumerable: true,
              configurable: true,
              get: function () {
                var ind = parentBlock.getData()[namespace].indexOf(blockData);
                return ind;
              },
              set: function () {

              }
            });

            Object.defineProperty(block, 'namespaceFull', {
              enumerable: true,
              configurable: true,
              get: function () {
                return parentBlock.namespaceFull + '[\'' + namespace + '\'][\'' + blockData.$index + '\']';
              },
              set: function () {

              }
            });
          }
          else {
            var pd = parentBlock.getData();
            if (pd !== undefined) {
              if (pd[namespace] === undefined) {
                pd[namespace] = blockData;
              } else {
                blockData = pd[namespace];
              }
            }

            Object.defineProperty(block, 'namespaceFull', {
              enumerable: true,
              configurable: true,
              get: function () {
                return parentBlock.namespaceFull + '[\'' + namespace + '\']';
              },
              set: function () {

              }
            });
          }
        }
      }

      if (!h.utils.isEmpty(node.attr('id'))) {
        blockId = node.attr('id');
        Object.defineProperty(blockData, '$' + blockId, {
          enumerable: true,
          configurable: true,
          get: function () {
            return isValid;
          },
          set: function (v) {
            isValid = v;
          }
        });
      }

      if (!isRoot && parentBlock.getData().$index !== undefined) {
        Object.defineProperty(blockData, '$parentIndex', {
          enumerable: true,
          configurable: true,
          get: function () {
            return parentBlock.getData().$index;
          },
          set: function () {

          }
        });
      }


      Object.defineProperty(blockData, '$valid', {
        enumerable: true,
        configurable: true,
        get: function () {
          return isValid;
        },
        set: function (v) {
          isValid = v;
        }
      });

      initDirectives(block);
      findChildrenBlocks(block);


      render.clear();
      render.draw(directives);


    }

    initBlock();
    return block;
  };
  return h;
}(hex));


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
          var r = false;
          for (var i in inputs) {
            if (inputs.hasOwnProperty(i)) {
              if (inputs[i].is(':checked') === true) {
                inputs[i].closest('label').addClass('checked');
                r = inputs[i].val();
              } else {
                inputs[i].closest('label').removeClass('checked');
              }
            }
          }
          return r;
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
              inputs[0].prop('checked', true);
            } else {
              inputs[0].closest('label').removeClass('checked');
              inputs[0].prop('checked', false);
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
                inputs[i].closest('label').addClass('checked');
              } else {
                inputs[i].prop('checked', false);
                inputs[i].closest('label').removeClass('checked');
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
      hideErrors();
    }

    function enable() {
      for (var i = 0, len = inputs.length; i < len; i++) {
        inputs[i].prop('disabled', false);
      }
      isDisabled = false;
      trigger('enable');
    }


    function validate(update, event) {
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
              if (event === undefined || validators[v].getEvents().indexOf(event) !== -1) {
                if (!validators[v].isValid(controlValue)) {
                  errors.push(validators[v].getClassName());
                  break;
                }
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
      errors: errors,
      showErrors: showErrors,
      hideErrors: hideErrors,
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

    function trigValidate(event) {
      validate(true, event.type);
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
          input.on(eventName, trigValidate);
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


var hex = (function (h) {
  'use strict';

  var hexForms = {};

  function HexForm(formId) {
    var hf = this;
    hf.errorText = 'Не удалось сохранить форму, попробуйте обновить страницу';
    hf.invalidText = 'Форма содержит ошибки';
    var form = $('#' + formId);
    var handlers = {};
    var dataType = 'formdata';
    hf.root = undefined;

    var formData = new FormData();
    var FormEvent = function (type) {
      this.type = type;
      this.stoped = false;
      this.stop = function () {
        this.stoped = true;
      };
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

    hf.trigger = function (eventName, params) {
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

    function getValues() {
      var data = $.extend({}, hf.root.getData());
      for (var name in data) {
        if (/^\$(.*)/.test(name)) {
          delete data[name];
        }
      }
      return data;
    }


    hf.draw = function () {
      hf.root.render.draw();
    };

    function clearErrors() {
      form.find('.has-error').removeClass('has-error');
      form.find('.alerts div').remove();
    }

    function reset(event) {
      var dontBreakReset = hf.trigger('beforeReset', {values: getValues()});
      if (dontBreakReset) {
        window.setTimeout(function () {
          clearErrors();
          hf.root.reset();
        }, 1);
      } else {
        event.preventDefault();
      }
      hf.trigger('afterReset', {});
    }


    function setFormData(data, name) {
      var namespace = '';
      if (name !== undefined) {
        namespace = name;
      }
      for (var k in data) {
        var v = data[k];
        k += '';
        if (k.indexOf('$') !== 0) {
          var nameZ = k;
          if (namespace !== '') {
            nameZ = namespace + '[' + k + ']';
          }

          if ($.isArray(v) || $.isPlainObject(v)) {
            setFormData(v, nameZ);
          } else {
            formData.append(nameZ, v);
          }
        }
      }
    }

    var submit = function (event) {
      event.preventDefault();
      event.stopPropagation();
      var data = getValues();
      var dontBreakBeforeValidation = hf.trigger('beforeValidation', {values: data});
      if (!dontBreakBeforeValidation) {
        return false;
      }
      var formValid = hf.root.validate(true);

      if (formValid === true) {
        clearErrors();

        var dontBreakBefore = hf.trigger('beforeSubmit', {values: data});
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

          if (dataType === 'formdata') {
            setFormData(data);
          } else {
            formData = data;
          }

          $.ajax({
            url: url,
            data: formData,
            type: method,
            dataType: 'json',
            processData: false,
            contentType: false,
            success: function (res) {
              var dontBreakAfter = hf.trigger('afterSubmit', res);
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

    var init = function () {
      form.addClass('loader-container').append('<div class="loader"></div>');
      form.attr('data-hex-block', '');
      form.on('submit', submit);
      form.on('reset', reset);
      if (form.find('.loader').size() === 0) {
        form.append('<div class="loader"></div>');
      }

      if (form.data('datatype') !== undefined) {
        dataType = form.data('datatype');
      }

      hf.root = new h.Block(form);

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

  h.remove = function (id) {
    if (hexForms[id] !== undefined) {
      hexForms[id] = undefined;
    }
  };

  $(document).ready(function () {
    h.form();
  });

  return h;
}(hex));

