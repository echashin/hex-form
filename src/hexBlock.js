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
    var namespaceFull = '';
    var controls = [];
    var render;
    var root;

    var isRoot = false;
    var lists = {};
    var listAdd = [];
    var listRemove = [];

    function getId() {
      return blockId;
    }


    function getNamespaceFull() {
      return namespaceFull;
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
      var ls = getLists(params.namespace);
      if (ls !== undefined) {
        for (var k = 0, kl = ls.length; k < kl; k++) {
          ls[k].add(params.item);
        }
        render.draw();
      }
    }

    function listRemoveItem(params) {
      var ls = parentBlock.getLists(params.namespace);
      if (ls !== undefined) {
        for (var k = 0, kl = ls.length; k < kl; k++) {
          ls[k].remove(params.index);
        }
        render.draw();
      }
    }

    //Поиск связей внутри блока
    function initDirectives(currentBlock) {
      var bindNodes = currentBlock.node.get(0).querySelectorAll('[data-hex-bind-html],[data-hex-bind-for],[data-hex-bind-class],[data-hex-bind-id],[data-hex-bind-href],[data-hex-bind-disabled],[data-hex-bind-name],[data-hex-bind-src],[data-hex-show],[data-hex-hide],[data-hex-list],[data-hex-list-add],[data-hex-list-remove],[data-hex-if]');
      bindNodes = Array.prototype.slice.call(bindNodes);
      bindNodes.push(currentBlock.node.get(0));
      for (var bn = 0, bnl = bindNodes.length; bn < bnl; bn++) {
        var findedNode = $(bindNodes[bn]);
        //Проверка того, что найденные элементы лежат непосредственно внутри нашего блока
        if (findedNode.closest('[data-hex-list-tpl]').size() === 0 && (findedNode.parents('[data-hex-block]').first().get(0) === currentBlock.node.get(0) || findedNode.get(0) === currentBlock.node.get(0))) {
          var attributes = h.utils.getAttributes(findedNode);
          for (var a in attributes) {
            if (attributes.hasOwnProperty(a)) {
              switch (a) {
                case 'data-hex-bind-html':
                case 'data-hex-bind-css':
                case 'data-hex-bind-disabled':
                case 'data-hex-bind-name':
                case 'data-hex-bind-href':
                case 'data-hex-bind-src':
                case 'data-hex-bind-id':
                case 'data-hex-bind-for':
                {
                  directives.push(new h.directives.Bind({
                    node: findedNode,
                    attribute: a,
                    namespaceFull: namespaceFull
                  }));
                  break;
                }
                case 'data-hex-show':
                {
                  directives.push(new h.directives.Show({node: findedNode, namespaceFull: namespaceFull}));
                  break;
                }
                case 'data-hex-if':
                {
                  if (findedNode.get(0) !== currentBlock.node.get(0)) {
                    directives.push(new h.directives.If({
                      node: findedNode,
                      namespaceFull: namespaceFull,
                      block: currentBlock
                    }));
                  }

                  break;
                }
                case 'data-hex-list':
                {
                  var list = new h.directives.List({
                    node: findedNode,
                    namespaceFull: namespaceFull,
                    data: currentBlock.getData(),
                    block: currentBlock
                  });
                  if (lists[list.getNamespace()] === undefined) {
                    lists[list.getNamespace()] = [];
                  }
                  lists[list.getNamespace()].push(list);
                  directives.push(list);
                  break;
                }
                case 'data-hex-list-add':
                {
                  var listAddNew = new h.directives.ListAdd({node: findedNode});
                  listAddNew.on('add', listAddItem);
                  listAdd.push(listAddNew);
                  break;
                }
                case 'data-hex-list-remove':
                {
                  var listRemoveNew = new h.directives.ListRemove({node: findedNode});
                  listRemoveNew.on('remove', listRemoveItem);
                  listRemove.push(listRemoveNew);
                  break;
                }
              }
            }
          }

          for (var d = 0, dl = directives.length; d < dl; d++) {
            if (render.directives.indexOf(directives[d]) === -1) {
              render.directives.push(directives[d]);
            }
          }
        }
      }

    }

    function setData(data) {
      h.utils.objectExtend(blockData, data);
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
      var names = controlName.replace(/['"]/g, '').replace(/[\[\]]/g, '.').replace(/\.+/g, '.').replace(/\.$/, '').split('.');
      var nml = names.length - 1;

      for (var i = 0; i <= nml; i++) {
        var aName = names[i];
        if (i < nml) {
          if (cObj[aName] === undefined) {
            if (h.utils.isInt(aName)) {
              cObj[aName] = [];
            } else {
              cObj[aName] = {};
            }
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

      control.on('change', function (value) {
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
          errorsBlock = formGroup.children('.errors');
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
          case 'select':
          case 'textarea':
          {
            break;
          }
          case 'input':
          {
            inputType = input.attr('type').toLowerCase();
            switch (inputType) {
              default:
              {
                controlConfig.type = inputType;
                break;
              }
              case 'checkbox':
              {
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
              case 'radio':
              {
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
      parent: parentBlock,
      childBlocks: childBlocks,
      $hexBlock: true,
      validate: validate,
      reset: reset,
      getId: getId,
      getLists: getLists,
      setData: setData,
      getData: getData,
      logErrors: logErrors,
      getNamespaceFull: getNamespaceFull
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

      //Убираем директивы
      for (var i = 0, l = directives.length; i < l; i++) {
        render.removeDirective(directives[i]);
      }

      if (!h.utils.isEmpty(parentBlock)) {
        if (!h.utils.isEmpty(namespace)) {
          var parentData = parentBlock.getData()[namespace];
          if (parentData !== undefined) {
            var dIndex = parentData.indexOf(blockData);
            if (dIndex !== -1) {
              parentData.splice(dIndex, 1);
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

      render.clear();
      root.validate(false);
    };


    function findChildrenBlocks(currentBlock) {
      var ownInputs = [];
      //Находим все инпуты внутри блока
      currentBlock.node.find('input[type!="submit"],select,textarea').each(function () {
        var el = $(this);
        var parentBlockNode = el.closest('[data-hex-block]');
        //Инпут находится непосредственно внутри нашего блока
        if (parentBlockNode.get(0) === node.get(0)) {
          ownInputs.push(el);
        }
      });

      currentBlock.node.find('[data-hex-block]').each(function () {
        var el = $(this);
        if (el.closest('[data-hex-list-tpl]').size() === 0 && (el.parents('[data-hex-block]:first').get(0) === currentBlock.node.get(0))) {
          currentBlock.addBlock(el);
        }
      });
      addControls(ownInputs, currentBlock);
    }


    function initBlock() {
      block.node = node;

      node.get(0).getBlock = function () {
        return block;
      };

      if (parentBlock !== undefined) {
        root = parentBlock.root;
        render = block.render = parentBlock.render;
      } else {
        root = block;
        parentBlock = false;
        block.parent = false;
        isRoot = true;
        render = block.render = new h.Render();
        blockData = render.data;
      }
      block.root = root;

      if (parentBlock !== false) {
        namespaceFull = parentBlock.getNamespaceFull();
      }

      if (!h.utils.isEmpty(node.attr('data-hex-block'))) {
        namespace = node.attr('data-hex-block');
        block.index = node.closest('[data-hex-list="' + namespace + '"]').children('[data-hex-block="' + namespace + '"]').index(node);
        namespaceFull += '[\'' + namespace + '\'][\'' + block.index + '\']';

      }

      if (h.utils.isEmpty(namespace) && parentBlock !== false) {
        blockData = parentBlock.getData();
      }


      if (!h.utils.isEmpty(namespace) && parentBlock !== false) {
        var bd = parentBlock.getData();
        if (bd !== undefined) {
          bd = bd[namespace];
          if (bd[block.index] === undefined) {
            bd[block.index] = blockData;
          } else {
            blockData = bd[block.index];
          }
        }
      }

      if (node.attr('id') !== undefined) {
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

      if (!h.utils.isEmpty(namespace)) {
        blockData.$index = block.index;
      }

      if (!h.utils.isEmpty(parentBlock)) {
        blockData.$parentIndex = parentBlock.getData().$index;
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
    }

    initBlock();
    return block;
  };
  return h;
}(hex));

