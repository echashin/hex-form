(function (window) {
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

  window.hex = h;
}(window));

