var hex = (function (h) {
        'use strict';
        h.directives.Disable = function (config) {
            var node, func, variables = [], block = false, functionVariables = [];

            function render(data) {
                var globalData = h.utils.objectProperty(data, config.block.namespaceFull);
                var fData = [];
                var result = false;
                if (!h.utils.isEmpty(globalData)) {

                    for (var i in functionVariables) {
                        fData.push(h.utils.objectProperty(globalData, functionVariables[i]));
                    }
                    result = func.apply(window, fData);
                }


                var controls = node.find('input[type!="submit"],select,textarea,button').addBack('input[type!="submit"],select,textarea,button');
                if (result) {
                    controls.each(function () {
                        if (block === false) {
                            $(this).prop('disabled', true);
                            $(this).trigger('disable');
                        } else {
                            block.disable();
                        }
                    });
                } else {
                    controls.each(function () {
                        if (block === false) {
                            $(this).prop('disabled', false);
                            $(this).trigger('enable');
                        } else {
                            block.enable();
                        }
                    });
                }
            }


            var directive = {
                render: render,
                type: 'disable'
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
                if (typeof node.get(0).getBlock === 'function') {
                    block = node.get(0).getBlock();
                }

                var expr = node.attr('data-hex-disable');
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
