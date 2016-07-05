var hex = (function (h) {
    'use strict';
    h.directives.If = function (config) {
      var node, func, comment, template, block, namespaceFull, variables = [];

      function render(data) {
        data = h.utils.objectProperty(data, namespaceFull);
        var result = func.call(null, data);
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
        get: function(){
          return variables.map(function (d) {
            return config.block.namespaceFull + d;
          });
        },
        set: function(){

        }
      });

      function init() {
        node = config.node;
        directive.node = node;
        template = node.clone(false);
        node.attr('data-hex-block', '');
        template.attr('data-hex-block', '');
        var expr = node.attr('data-hex-if');
        block = config.block;
        namespaceFull = config.namespaceFull;
        var f = h.utils.exprToFunc(expr);
        for (var i = 0, l = f.vars.length; i < l; i++) {
          variables.push(f.vars[i]);
        }
        func = new Function('__data', f.func);
        comment = $(document.createComment('hex-if (' + expr + ')'));
        comment.insertBefore(node.get(0));
      }


      init();
      return directive;
    };

    return h;
  }(hex)
);
