var hex = (function (h) {
    'use strict';
    h.directives.Bind = function (config) {

      var node, namespaceFull, attribute, func;

      function render(data) {
        data = h.utils.objectProperty(data, namespaceFull);

        switch (attribute) {
          case 'html':
          {
            node.get(0).innerHTML = func(data);
            break;
          }
          default:
          {
            node.attr(attribute, func(data));
          }
        }
      }


      var directive = {
        render: render,
        variables: []
      };

      function init() {
        node = config.node;
        namespaceFull = config.namespaceFull;
        var expr = node.attr(config.attribute);
        attribute = config.attribute.replace('data-hex-bind-', '');
        var f = h.utils.exprToFunc(expr);
        for (var i = 0, l = f.vars.length; i < l; i++) {
          directive.variables.push(namespaceFull + f.vars[i]);
        }


        func = new Function('__data', f.func);

      }

      init();
      return directive;
    };

    return h;
  }(hex)
);
