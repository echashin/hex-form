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
