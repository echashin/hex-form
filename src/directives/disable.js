var hex = (function (h) {
    'use strict';
    h.directives.Disable = function (config) {
      var node, func, variables = [];

      function render(data) {
        data = h.utils.objectProperty(data, config.block.namespaceFull);
        var result = func.call(null, data);
        var controls = node.find('input[type!="submit"],select,textarea,button').addBack('input[type!="submit"],select,textarea,button');


        if (result === true) {
          controls.each(function () {
            $(this).prop('disabled', true);
            $(this).trigger('disable');

          });
        } else {
          controls.each(function () {
            $(this).prop('disabled', false);
            $(this).trigger('enable');
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
