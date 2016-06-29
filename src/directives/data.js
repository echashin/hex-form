var hex = (function (h) {
    'use strict';
    h.directives.Data = function (config) {

      var node, namespaceFull, filter, variables = [], map;

      function render(data) {
        for (var variable in map) {
          if (!h.utils.isEmpty(data[map[variable]])) {
            if (filter !== undefined) {
              node.data(variable, filter(data[map[variable]]));
            } else {
              node.data(variable, data[map[variable]]);
            }
          } else {
            node.data(variable, undefined);
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


        var params = JSON.parse(node.attr('data-hex-data'));


        if (params.filter !== undefined) {
          filter = window[params.filter];
          if (filter === undefined) {
            console.warn('function ' + params.filter + ' doesn,t exist');
          }
        }

        for (var variable in params.vars) {
          directive.variables.push(variable);
        }
        map = params.vars;
      }

      init();
      return directive;
    };

    return h;
  }(hex)
);
