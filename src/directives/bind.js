var hex = (function (h) {
        'use strict';
        h.directives.Bind = function (config) {

            var node, attribute, func, variables = [], functionVariables = [];


            function render(data) {
                var globalData = h.utils.objectProperty(data, config.block.namespaceFull);

                if (globalData === undefined) {
                    globalData = {};
                }

                var fData = [];


                for (var i in functionVariables) {
                    fData.push(h.utils.objectProperty(globalData, functionVariables[i]));
                }

                var result = func.apply(window, fData);

                switch (attribute) {
                    case 'html': {
                        node.get(0).innerHTML = result;
                        break;
                    }
                    case 'id': {
                        node.attr(attribute, result);
                        break;
                    }
                    default: {
                        node.attr(attribute, result);
                        if (/^data-/.test(attribute)) {
                            var dataOption = attribute.replace('data-', '');
                            node.data(dataOption, result);
                            node.attr(attribute, result);
                        }
                        break;
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
                functionVariables = f.functionVars;

                func = new Function(f.functionVars.join(','), f.func);
            }


            init();
            return directive;
        };

        return h;
    }(hex)
);
