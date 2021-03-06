var hex = (function (h) {
    'use strict';
    h.Block = function (node, parentBlock) {
        var
            isValid = true; //Валиден блок или нет
        var blockId = false;
        var directives = [];
        var blockData = {};
        var childBlocks = [];
        var namespace = '';
        var controls = [];
        var render;
        var root;

        var $index;
        var isRoot = false;
        var lists = {};
        var listAdd = [];
        var listUp = [];
        var listRemove = [];

        function getId() {
            return blockId;
        }


        function getLists(ns) {
            if (ns === undefined) {
                return lists;
            } else {
                return lists[ns];
            }
        }

        function logErrors() {
            for (var i = 0, il = controls.length; i < il; i++) {
                if (!controls[i].validate(true)) {
                    console.warn(controls[i].getName());
                }
            }
            for (i = 0, il = childBlocks.length; i < il; i++) {
                childBlocks[i].logErrors();
            }
        }

        function listAddItem(params) {
            blockData[params.namespace].push({});
            render.draw();
        }


        function removeDirectives() {
            //Убираем директивы
            for (var i = 0, l = directives.length; i < l; i++) {
                render.removeDirective(directives[i]);
            }
            directives = [];
            for (var j = 0, lc = childBlocks.length; j < lc; j++) {
                childBlocks[j].removeDirectives();
            }

        }

        function listRemoveItem(params) {
            var parentData = parentBlock.getData()[params.namespace];
            var index = parentData.indexOf(params.data);

            if (index !== -1) {
                parentData.splice(index, 1);
                removeDirectives();

                render.clear();
                render.draw();
            }
        }

        function listUpItem(params) {
            var parentData = parentBlock.getData()[params.namespace];
            var index = parentData.indexOf(params.data);
            if (index > 0) {
                var from = index;
                var to = index - 1;
                parentData.splice(to, 0, parentData.splice(from, 1)[0]);
            }
            for (var i = index + 1, l = parentData.length; i < l; i++) {
                parentData[i].$index = i;
            }

            render.draw();
        }

        //Поиск связей внутри блока
        function initDirectives(currentBlock) {
            var s = '[data-hex-bind-html],[data-hex-bind-title],[data-hex-bind-for],[data-hex-bind-class],[data-hex-bind-data-content],[data-hex-bind-id],[data-hex-bind-href],[data-hex-disable],[data-hex-bind-name],[data-hex-bind-src],[data-hex-show],[data-hex-hide],[data-hex-list],[data-hex-list-add],[data-hex-list-remove],[data-hex-list-up],[data-hex-if],[data-hex-data]';
            var bindNodes = currentBlock.node.find(s).addBack();

            bindNodes.each(function () {
                var findedNode = $(this);
                //Проверка того, что найденные элементы лежат непосредственно внутри нашего блока

                if (findedNode.parents('[data-hex-if]').size() === 0 && findedNode.closest('[data-hex-list-tpl]').size() === 0 && (findedNode.closest('[data-hex-block]').first().get(0) === currentBlock.node.get(0) || findedNode.get(0) === currentBlock.node.get(0))) {
                    var attributes = h.utils.getAttributes(findedNode);
                    for (var a in attributes) {
                        if (attributes.hasOwnProperty(a)) {
                            switch (a) {
                                case 'data-hex-bind-html':
                                case 'data-hex-bind-css':
                                case 'data-hex-bind-title':
                                case 'data-hex-bind-name':
                                case 'data-hex-bind-href':
                                case 'data-hex-bind-src':
                                case 'data-hex-bind-id':
                                case 'data-hex-bind-for':
                                case 'data-hex-bind-data-content':
                                case 'data-hex-bind-class': {
                                    directives.push(new h.directives.Bind({
                                        node: findedNode,
                                        attribute: a,
                                        block: currentBlock
                                    }));
                                    break;
                                }
                                case 'data-hex-show': {
                                    directives.push(new h.directives.Show({node: findedNode, block: currentBlock}));
                                    break;
                                }
                                case 'data-hex-data': {
                                    directives.push(new h.directives.Data({node: findedNode, block: currentBlock}));
                                    break;
                                }
                                case 'data-hex-if': {
                                    directives.push(new h.directives.If({
                                        node: findedNode,
                                        block: currentBlock
                                    }));
                                    break;
                                }
                                case 'data-hex-disable': {
                                    directives.push(new h.directives.Disable({
                                        node: findedNode,
                                        block: currentBlock
                                    }));
                                    break;
                                }
                                case 'data-hex-list': {
                                    var list = new h.directives.List({
                                        node: findedNode,
                                        block: currentBlock
                                    });

                                    if (lists[list.getNamespace()] === undefined) {
                                        lists[list.getNamespace()] = [];
                                    }
                                    lists[list.getNamespace()].push(list);
                                    directives.push(list);
                                    break;
                                }
                                case 'data-hex-list-add': {
                                    var listAddNew = new h.directives.ListAdd({node: findedNode});
                                    listAddNew.on('add', listAddItem);
                                    listAdd.push(listAddNew);
                                    break;
                                }
                                case 'data-hex-list-remove': {
                                    var listRemoveNew = new h.directives.ListRemove({
                                        node: findedNode,
                                        block: currentBlock
                                    });
                                    listRemoveNew.on('remove', listRemoveItem);
                                    directives.push(listRemoveNew);
                                    break;
                                }
                                case 'data-hex-list-up': {
                                    var listUpNew = new h.directives.ListUp({node: findedNode});
                                    listUpNew.on('up', listUpItem);
                                    listUp.push(listUpNew);
                                    break;
                                }
                            }
                        }
                    }

                    for (var d = 0, dl = directives.length; d < dl; d++) {
                        render.addDirective(directives[d]);
                    }
                }
            });

        }

        function disable() {

            for (var i = 0, il = controls.length; i < il; i++) {
                controls[i].disable();
            }
        }

        function enable() {
            for (var i = 0, il = controls.length; i < il; i++) {
                controls[i].enable();
            }
        }

        function setData(data) {
            h.utils.objectExtend(blockData, data);
        }

        function getAllControls(allc) {
            if (allc === undefined || allc === false) {
                allc = [];
            }
            allc = allc.concat(controls);
            for (var i = 0, il = childBlocks.length; i < il; i++) {
                allc=childBlocks[i].getAllControls(allc);
            }
            return allc;
        }

        function getData() {
            return blockData;
        }


        function validate(update) {
            var blockValid = true;
            for (var i = 0, il = controls.length; i < il; i++) {
                if (!controls[i].validate(update)) {
                    blockValid = false;
                }
            }
            for (i = 0, il = childBlocks.length; i < il; i++) {
                if (!childBlocks[i].validate(update)) {
                    blockValid = false;
                }
            }
            isValid = blockValid;
            return isValid;
        }


        function reset() {
            isValid = true;
            for (var i = 0, il = controls.length; i < il; i++) {
                controls[i].reset();
            }
            for (i = 0, il = childBlocks.length; i < il; i++) {
                childBlocks[i].reset();
            }
            render.draw();
        }


        function removeControl(control) {

            var controlName = control.getName();
            var names = controlName.replace(/['"]/g, '').replace(/[\[\]]/g, '.').replace(/\.+/g, '.').replace(/\.$/, '').replace(/^\./, '').split('.');
            var nml = names.length - 1;

            var cObj = blockData;
            for (var i = 0; i <= nml; i++) {
                var aName = names[i];

                if (i < nml) {
                    if (cObj[aName] !== undefined) {
                        cObj = cObj[aName];
                    }
                } else {

                    if (cObj[aName] !== undefined) {
                        if ($.isArray(cObj)) {
                            cObj.splice(aName, 1);
                        } else {
                            delete cObj[aName];
                        }
                    }
                }
            }
            var index = controls.indexOf(control);
            if (index !== -1) {
                controls.splice(index, 1);
            }

        }

        function addControl(control) {
            var cObj = blockData;
            var controlName = control.getName();
            var names = controlName.replace(/['"]/g, '').replace(/[\[\]]/g, '.').replace(/\.+/g, '.').replace(/\.$/, '').split('.').filter(function (n) {
                return !h.utils.isEmpty(n);
            });
            var nml = names.length - 1;
            var defaultVal = hex.utils.objectProperty(blockData, controlName);
            if (!h.utils.isEmpty(defaultVal)) {
                control.setValue(defaultVal);
            }

            for (var i = 0; i <= nml; i++) {
                var aName = names[i];
                if (i < nml) {
                    if (h.utils.isEmpty(cObj[aName]) || typeof cObj[aName] !== 'object') {
                        cObj[aName] = {};
                    }
                    cObj = cObj[aName];
                } else {
                    Object.defineProperty(cObj, aName, {
                        enumerable: true,
                        configurable: true,
                        get: control.getValue,
                        set: control.setValue
                    });
                }
            }


            control.on('change', function () {
                //h.utils.objectProperty(blockData, controlName, value);
                render.draw();
            });


            control.on('disable', function () {

            });
            control.on('enable', function () {

            });


            control.on('validate', function () {
                root.validate(false);
                render.draw();
            });
        }

        //Добавляем контролы в блок
        function addControls(newInputs, currentBlock) {
            var tmpConfigs = {};
            for (var i in newInputs) {
                var input = newInputs[i];

                var controlName = input.attr('name');
                var errorsBlock;
                var formGroup = input.closest('.form-group');
                if (formGroup.size() <= 0) {
                    formGroup = undefined;
                } else {
                    errorsBlock = formGroup.find('.errors');
                    if (errorsBlock.size() <= 0) {
                        errorsBlock = undefined;
                    }
                }

                var tagName = input.prop('tagName').toLowerCase();
                var inputType = tagName;

                var controlConfig = {
                    type: inputType,
                    inputs: [input],
                    formGroup: formGroup,
                    errorsBlock: errorsBlock,
                    block: currentBlock,
                    name: controlName
                };


                switch (tagName) {
                    case 'select': {
                        controlConfig.type = 'select';
                        break;
                    }
                    case 'textarea': {
                        controlConfig.type = 'textarea';
                        break;
                    }
                    case 'input': {
                        inputType = input.attr('type').toLowerCase();
                        switch (inputType) {
                            default: {
                                controlConfig.type = inputType;
                                break;
                            }
                            case 'checkbox': {
                                inputType = 'checkbox';
                                controlConfig.type = inputType;
                                if (input.attr('value') !== undefined) {
                                    controlConfig.trueValue = input.attr('value');
                                }
                                if (input.attr('data-hex-true-value') !== undefined) {
                                    controlConfig.trueValue = input.attr('data-hex-true-value');
                                }
                                if (input.attr('data-hex-false-value') !== undefined) {
                                    controlConfig.falseValue = input.attr('data-hex-false-value');
                                }
                                break;
                            }
                            case 'radio': {
                                controlConfig.type = 'radio';
                                break;
                            }
                        }
                        break;
                    }
                }
                if (tmpConfigs[controlName] === undefined) {
                    tmpConfigs[controlName] = controlConfig;
                } else {
                    tmpConfigs[controlName].inputs.push(input);
                }
            }

            for (var cName in tmpConfigs) {
                if (tmpConfigs.hasOwnProperty(cName)) {
                    controls.push(new hex.Control(tmpConfigs[cName]));
                }
            }

            for (var c = 0, len = controls.length; c < len; c++) {
                addControl(controls[c]);
            }

        }


        var block = {
            controls: controls,
            getAllControls: getAllControls,
            parent: parentBlock,
            childBlocks: childBlocks,
            $hexBlock: true,
            validate: validate,
            reset: reset,
            getId: getId,
            getLists: getLists,
            setData: setData,
            getData: getData,
            disable: disable,
            enable: enable,
            directives: directives,
            removeDirectives: removeDirectives,
            logErrors: logErrors
        };

        block.addBlock = function (newBlock) {
            if (newBlock.$hexBlock === undefined) {
                newBlock = new h.Block(newBlock, block);
            }
            var index = childBlocks.indexOf(newBlock);
            if (index === -1) {
                childBlocks.push(newBlock);
                return newBlock;
            } else {
                return childBlocks[index];
            }
        };

        block.remove = function () {
            //Убираем контролы и их привязки к данным
            while (block.controls.length > 0) {
                removeControl(block.controls[0]);
            }

            removeDirectives();

            if (!h.utils.isEmpty(parentBlock)) {
                if (!h.utils.isEmpty(namespace)) {
                    var parentData = parentBlock.getData()[namespace];
                    if (parentData !== undefined) {
                        if (parentData === blockData) {
                            delete parentBlock.getData()[namespace];
                        } else {
                            if ($.isArray(parentData)) {
                                var dIndex = parentData.indexOf(blockData);
                                if (dIndex !== undefined && dIndex !== -1) {
                                    parentData.splice(dIndex, 1);
                                }
                            }
                        }
                    }
                }
                var bIndex = parentBlock.childBlocks.indexOf(block);
                if (bIndex !== -1) {
                    parentBlock.childBlocks.splice(bIndex, 1);
                }
            }

            while (block.childBlocks.length > 0) {
                block.childBlocks[0].remove();
            }
            node.remove();
            root.validate(false);
        };


        function findChildrenBlocks(currentBlock) {
            var ownInputs = [];
            //Находим все инпуты внутри блока
            currentBlock.node.find('input[type!="submit"],select,textarea').each(function () {
                var el = $(this);
                var parentBlockNode = el.closest('[data-hex-block]');
                //Инпут находится непосредственно внутри нашего блока не в шаблоне и не в hex-if
                if (el.closest('[data-hex-list-tpl]').size() === 0 && el.closest('[data-hex-if]').size() === 0 && parentBlockNode.get(0) === node.get(0)) {
                    ownInputs.push(el);
                }
            });
            addControls(ownInputs, currentBlock);

            currentBlock.node.find('[data-hex-block]').each(function () {
                var el = $(this);
                if (el.closest('[data-hex-list-tpl]').size() === 0 && el.closest('[data-hex-if]').size() === 0 && (el.parents('[data-hex-block]:first').get(0) === currentBlock.node.get(0))) {
                    currentBlock.addBlock(el);
                }
            });

        }


        function initBlock() {
            block.node = node;

            node.get(0).getBlock = function () {
                return block;
            };

            if (!h.utils.isEmpty(parentBlock)) {
                root = parentBlock.root;
                render = block.render = parentBlock.render;
                isRoot = false;
            } else {
                root = block;
                parentBlock = false;
                block.parent = undefined;
                isRoot = true;
                render = block.render = new h.Render();
                blockData = render.data;
                block.namespaceFull = '';
            }
            block.root = root;


            if (!h.utils.isEmpty(node.attr('data-hex-block'))) {
                namespace = node.attr('data-hex-block');
                $index = undefined;
                if (node.closest('[data-hex-list="' + namespace + '"]').size() > 0) {
                    $index = node.closest('[data-hex-list="' + namespace + '"]').children('[data-hex-block="' + namespace + '"]').index(node);
                }
            }

            if (!isRoot) {
                if (h.utils.isEmpty(namespace)) {
                    blockData = parentBlock.getData();
                    Object.defineProperty(block, 'namespaceFull', {
                        enumerable: true,
                        configurable: true,
                        get: function () {
                            return parentBlock.namespaceFull;
                        },
                        set: function () {

                        }
                    });
                } else {
                    //Если блок внутри списка
                    if ($index !== undefined) {
                        var bd = parentBlock.getData();
                        if (bd !== undefined) {
                            bd = bd[namespace];
                            if (bd[$index] === undefined) {
                                bd[$index] = blockData;
                            } else {
                                blockData = bd[$index];
                            }
                        }

                        Object.defineProperty(blockData, '$index', {
                            enumerable: true,
                            configurable: true,
                            get: function () {
                                var ind = parentBlock.getData()[namespace].indexOf(blockData);
                                return ind;
                            },
                            set: function () {

                            }
                        });

                        Object.defineProperty(block, 'namespaceFull', {
                            enumerable: true,
                            configurable: true,
                            get: function () {
                                return parentBlock.namespaceFull + '[\'' + namespace + '\'][\'' + blockData.$index + '\']';
                            },
                            set: function () {

                            }
                        });
                    }
                    else {
                        var pd = parentBlock.getData();
                        if (pd !== undefined) {
                            if (pd[namespace] === undefined) {
                                pd[namespace] = blockData;
                            } else {
                                blockData = pd[namespace];
                            }
                        }

                        Object.defineProperty(block, 'namespaceFull', {
                            enumerable: true,
                            configurable: true,
                            get: function () {
                                return parentBlock.namespaceFull + '[\'' + namespace + '\']';
                            },
                            set: function () {

                            }
                        });
                    }
                }
            }

            if (!h.utils.isEmpty(node.attr('id'))) {
                blockId = node.attr('id');
                Object.defineProperty(blockData, '$' + blockId, {
                    enumerable: true,
                    configurable: true,
                    get: function () {
                        return isValid;
                    },
                    set: function (v) {
                        isValid = v;
                    }
                });
            }

            if (!isRoot && parentBlock.getData().$index !== undefined) {
                Object.defineProperty(blockData, '$parentIndex', {
                    enumerable: true,
                    configurable: true,
                    get: function () {
                        return parentBlock.getData().$index;
                    },
                    set: function () {

                    }
                });
            }


            Object.defineProperty(blockData, '$valid', {
                enumerable: true,
                configurable: true,
                get: function () {
                    return isValid;
                },
                set: function (v) {
                    isValid = v;
                }
            });

            initDirectives(block);
            findChildrenBlocks(block);

            render.clear();
            render.draw(directives);


        }

        initBlock();
        return block;
    };
    return h;
}(hex));

