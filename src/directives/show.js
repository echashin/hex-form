var hex = (function (h) {
  'use strict';
  h.directives.Show = function (config) {

    var node, func, namespaceFull;

    function render(data) {

      data = h.utils.objectProperty(data, namespaceFull);
      var r = func.call(null, data);
      if (r) {
        node.removeClass('hide');
      } else {
        node.addClass('hide');
      }
    }


    var directive = {
      render: render,
      variables: []
    };

    function init() {
      node = $(config.node);
      node.addClass('hide');
      namespaceFull = config.namespaceFull;
      var expr = node.attr('data-hex-show');
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
}(hex));
