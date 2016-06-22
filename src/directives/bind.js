/*jslint evil: true */
var hex = (function (h) {
    'use strict';
    h.directives.Bind = function (config) {

      var node, attribute, func;

      function render(data) {

        switch (attribute) {
          case 'html':
          {
            node.get(0).innerHTML = func.call(null, data);
            break;
          }
          default:
          {
            node.attr(attribute, func.call(null, data));
          }
        }
      }

      var directive = {
        render: render,
        variables: []
      };

      function init() {
        node = config.node;
        var expr = node.attr(config.attribute);
        attribute = config.attribute.replace('data-hex-bind-', '');
        var f = h.utils.exprToFunc(expr);
        directive.variables = directive.variables.concat(f.vars);
        func = new Function('__data', f.func);
      }

      init();
      return directive;
    };

    return h;
  }(hex)
);
