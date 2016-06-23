var hex = (function (h) {
  'use strict';
  h.Block = function (node, parentBlock) {


    var
      isValid = true; //Валиден блок или нет
    var blockId = false;
    var directives = [];
    var linkedVars = [];
    var blockData = {};
    var childBlocks = [];
    var namespace = false;
    var controls = [];
    var dataLastVersion = {};
    var root;

    var lists = {};
    var listAdd = [];
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

    function listAddItem(params) {
      var ls = getLists(params.namespace);
      if (ls !== undefined) {
        for (var k = 0, kl = ls.length; k < kl; k++) {
          ls[k].add(params.item);
        }
      }
    }

    function listRemoveItem(params) {
      var ls = parentBlock.getLists(params.namespace);
      if (ls !== undefined) {
        for (var k = 0, kl = ls.length; k < kl; k++) {
          ls[k].remove(params.index);
        }
      }
    }

    //Поиск связей внутри блока
    function initDirectives(currentBlock) {
      var bindNodes = currentBlock.node.get(0).querySelectorAll('[data-hex-bind-html],[data-hex-bind-class],[data-hex-bind-id],[data-hex-bind-href],[data-hex-bind-disabled],[data-hex-bind-name],[data-hex-bind-src],[data-hex-show],[data-hex-hide],[data-hex-list],[data-hex-list-add],[data-hex-list-remove]');
      bindNodes = Array.prototype.slice.call(bindNodes);
      bindNodes[bindNodes.length] = currentBlock.node.get(0);
      for (var bn = 0, bnl = bindNodes.length; bn < bnl; bn++) {
        var findedNode = $(bindNodes[bn]);
        //Проверка того, что найденные элементы лежат непосредственно внутри нашего блока
        if (findedNode.closest('[data-hex-block]').get(0) === currentBlock.node.get(0)) {
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
                {
                  directives.push(new h.directives.Bind({node: findedNode, attribute: a}));
                  break;
                }
                case 'data-hex-show':
                {
                  directives.push(new h.directives.Show({node: findedNode}));
                  break;
                }
                case 'data-hex-list':
                {
                  var list = new h.directives.List({node: findedNode, data: currentBlock.getData(), block: currentBlock});
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
        }
      }


      for (var d = 0, len = directives.length; d < len; d++) {
        linkedVars = linkedVars.concat(directives[d].variables);
      }
      linkedVars = h.utils.arrayUniq(linkedVars);
    }

    function render() {
      var changedVars = [];
      var data = $.extend({}, blockData);
      for (var i = 0, length = linkedVars.length; i < length; i++) {
        var paramAsString = linkedVars[i];
        var value = h.utils.objectProperty(data, paramAsString);
        if (value === undefined) {
          h.utils.objectProperty(data, paramAsString, '');
        }
        if (JSON.stringify(value) !== dataLastVersion[paramAsString]) {
          changedVars.push(paramAsString);
        }
      }
      if (changedVars !== undefined && changedVars.length > 0) {
        var bindings = directives.filter(function (bind) {
          for (i = 0, length = changedVars.length; i < length; i++) {
            if (bind.variables.indexOf(changedVars[i]) >= 0) {
              return true;
            }
          }
          return false;
        });

        for (i = 0, length = bindings.length; i < length; i++) {
          bindings[i].render(data);
        }
        //Сохраняем последние изменения данных
        for (i = 0, length = changedVars.length; i < length; i++) {
          dataLastVersion[changedVars[i]] = JSON.stringify(h.utils.objectProperty(blockData, changedVars[i]));
        }
      }
      if (childBlocks.length > 0) {
        for (i = 0, length = childBlocks.length; i < length; i++) {
          childBlocks[i].render();
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
      render();
    }


    function addControl(control) {
      var cObj = blockData;
      var controlName = control.getName();
      dataLastVersion[controlName] = control.getValue();
      var names = controlName.replace(/['"]/g, '').replace(/[\[\]]/g, '.').replace(/\.+/g, '.').replace(/\.$/, '').split('.');
      var nml = names.length - 1;

      function setV(v) {
        control.setValue(v);
        root.render();
      }

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
            set: setV
          });
        }
      }
      control.on('change', function (value) {
        h.utils.objectProperty(blockData, controlName, value);
      });

      control.on('validate', function () {
        root.validate(false);
        root.render();
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
      render: render,
      validate: validate,
      reset: reset,
      getId: getId,
      getLists: getLists,
      setData: setData,
      getData: getData
    };

    block.addBlock = function (newBlock) {

      if (newBlock instanceof h.Block === false) {
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
      node.remove();
      if (parentBlock !== false) {
        if (namespace !== false) {
          if (parentBlock.getData()[namespace] !== undefined) {
            if ($.isArray(parentBlock.getData()[namespace])) {
              var dIndex = parentBlock.getData()[namespace].indexOf(blockData);
              if (dIndex !== -1) {
                parentBlock.getData()[namespace].splice(dIndex, 1);
              }
            }
          }
        }
        var bIndex = parentBlock.childBlocks.indexOf(block);
        if (bIndex !== -1) {
          parentBlock.childBlocks.splice(bIndex, 1);
        }
        parentBlock.validate(false);
        parentBlock.root.render();
      }
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
        if (el.parents('[data-hex-block]:first').get(0) === currentBlock.node.get(0)) {
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
      } else {
        root = block;
        parentBlock = false;
        block.parent = false;
      }
      block.root = root;


      if (node.closest('[data-hex-list]').size() > 0) {
        namespace = node.closest('[data-hex-list]').attr('data-hex-list');

        if (namespace === undefined) {
          throw new Error('attr hex-list is Empty');
        }
        block.index = node.closest('[data-hex-list]').children('[data-hex-block]').index(node);
      }

      if (h.utils.isEmpty(namespace) && parentBlock !== false) {
        blockData = parentBlock.getData();
      }


      if (!h.utils.isEmpty(namespace) && parentBlock !== false) {
        var bd = parentBlock.getData();
        if (bd !== undefined) {
          if (bd[namespace] === undefined) {
            //console.log(bd, _namespace);
          }
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
          set: function () {

          }
        });
      }

      initDirectives(block);
      findChildrenBlocks(block);

      Object.defineProperty(blockData, '$valid', {
        enumerable: true,
        configurable: true,
        get: function () {
          return isValid;
        },
        set: function () {

        }
      });


    }

    initBlock();
    return block;
  };
  return h;
}(hex));

