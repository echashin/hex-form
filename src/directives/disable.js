var hex = (function (h) {
    'use strict';
    h.directives.Disable = function (config) {
      var node, func, controls, namespaceFull;

      function render(data) {
        data = h.utils.objectProperty(data, namespaceFull);
        var result = func.call(null, data);
        if (result === true) {
          node.css('border', '1px solid red');
          controls.each(function () {
            $(this).trigger('disable');
          });
        } else {
          node.css('border', '1px solid green');
          controls.each(function () {
            $(this).trigger('enable');
          });
        }
      }


      var directive = {
        render: render,
        variables: []
      };

      function init() {
        node = config.node;
        var expr = node.attr('data-hex-disable');
        namespaceFull = config.namespaceFull;
        var f = h.utils.exprToFunc(expr);
        for (var i = 0, l = f.vars.length; i < l; i++) {
          directive.variables.push(namespaceFull + f.vars[i]);
        }

        controls = node.find('input[type!="submit"],select,textarea');

        func = new Function('__data', f.func);
      }

      init();
      return directive;
    };

    return h;
  }(hex)
);
