var hex = (function (h) {
        'use strict';
        h.directives.If = function (config) {
            var node, func, comment, template, block, variables = [], functionVariables = [];

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
                template = node.clone(false);
                template.attr('data-hex-block', '');
                var expr = node.attr('data-hex-if');
                block = config.block;

                var f = h.utils.exprToFunc(expr);
                for (var i = 0, l = f.vars.length; i < l; i++) {
                    variables.push(f.vars[i]);
                }
                functionVariables = f.functionVars;
                func = new Function(f.functionVars.join(','), f.func);
                comment = $(document.createComment('* hex-if *'));
                comment.insertBefore(node.get(0));
                template.removeAttr('data-hex-if');
                node.remove();
                node = undefined;
            }


            init();
            return directive;
        };

        return h;
    }(hex)
);
