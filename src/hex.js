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
  window.hex = h;
}(window));

