var hex = (function (h) {
    'use strict';
    h.directives.Data = function (config) {

      var node, namespaceFull, filter, variables = [], map;

      function render(data) {

        //data = h.utils.objectProperty(data, namespaceFull);
        console.log(map);
        console.log(data);
        /*
        for (var variable in map) {

          //node.data(variable, filter(data[map[variable]]));
        }
        */
      }


      var directive = {
        render: render,
        variables: []
      };

      function init() {
        node = config.node;
        namespaceFull = config.namespaceFull;

        /*
        var params = JSON.parse(node.attr('data-hex-data'));


        if (params.filter !== undefined) {
          filter = window[params.filter];
          if (filter === undefined) {
            console.warn('function ' + params.filter + ' doesn,t exist');
          }
        } else {
          filter = function (data) {
            return data;
          }
        }

        for (var variable in params.vars) {
          directive.variables.push(variable);
        }
        map = params.vars;
        */
        console.log('init');
      }

      init();
      return directive;
    };

    return h;
  }(hex)
);
