var hex = (function (h) {
    'use strict';
    h.directives.Show = function (config) {

        var node, func, variables = [],functionVariables=[];

        function render(data) {
            var globalData = h.utils.objectProperty(data, config.block.namespaceFull);
            var fData = [];
            var r = false;
            if (!h.utils.isEmpty(globalData)) {

                for (var i in functionVariables) {
                    fData.push(h.utils.objectProperty(globalData, functionVariables[i]));
                }
                r = func.apply(window, fData);
            }
            if (r) {
                node.removeClass('hide');
            } else {
                node.addClass('hide');
            }
        }


        var directive = {
            render: render,
            type: 'show'
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
            node = $(config.node);
            node.addClass('hide');
            var expr = node.attr('data-hex-show');
            var f = h.utils.exprToFunc(expr);
            for (var i = 0, l = f.vars.length; i < l; i++) {
                variables.push(f.vars[i]);
            }
            functionVariables = f.functionVars;
            func = new Function(f.functionVars.join(','), f.func);
        }

        init();
        return directive;
    };

    return h;
}(hex));
