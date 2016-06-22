var hex = (function (h) {
  'use strict';
  h.directives.Show = function (config) {

    var node, func;

    function render(data) {
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
      var expr = node.attr('data-hex-show');
      var f = h.utils.exprToFunc(expr);

      directive.variables = f.vars;
      func = new Function('__data', f.func);
    }

    init();
    return directive;
  };

  return h;
}(hex));
