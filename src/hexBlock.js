var hex = (function (h) {
  'use strict';

  h.Block = function (element, form, parentBlock) {
    var block = this;
    block.element = undefined;
    //Вложенные блоки
    block.childBlocks = [];
    //Собственные контролы
    block.controls = [];
    //Родительский блок если есть
    block.parent = undefined;
    var tab;
    //id нашего блока
    block.id = undefined;
    block.valid = true;
    block.form = undefined;





    block.hideErrors = function () {
      if (tab !== undefined) {
        tab.removeClass('has-error');
      }
    };

    block.findBlockById = function (fId) {
      if (block.id === fId) {
        return block;
      } else {
        for (var b in block.childBlocks) {
          var finded = block.childBlocks[b].findBlockById(fId);
          if (finded !== false) {
            return finded;
          }
        }
        return false;
      }
    };

    block.addBlock = function (blockEl) {
      block.childBlocks.push(new h.Block(blockEl, form, block));
    };

    block.showErrors = function () {
      if (tab !== undefined) {
        tab.addClass('has-error');
      }
    };

    block.isValid = function (update) {
      var blockValid = true;
      for (var c in block.controls) {
        if (!block.controls[c].isValid(update)) {
          blockValid = false;
        }
      }
      for (var b in block.childBlocks) {
        if (!block.childBlocks[b].isValid(update)) {
          blockValid = false;
        }
      }
      block.valid = blockValid;
      if (tab !== undefined) {
        if (blockValid) {
          tab.removeClass('has-error');
        } else {
          block.showErrors();
        }
      }
      return block.valid;
    };

    block.setValid = function () {

    };


    block.getValues = function () {

    };


    //Добавляем контролы в блок
    var addControls = function (newInputs) {
      var tmpConfigs = {};
      for (var i in newInputs) {
        var input = newInputs[i];
        if (input.parents('[data-hex-multy-item="$"]').size() <= 0) {
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
            block: block,
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
      }

      for (var cName in tmpConfigs) {
        if (tmpConfigs.hasOwnProperty(cName)) {
          var newControl = new hex.Control(tmpConfigs[cName]);
          block.controls.push(newControl);
          block.form.controls.push(newControl);
        }
      }
    };

    function findChildrenBlocks() {
      var ownInputs = [];
      var ownBlocks = {};
      //Находим все инпуты внутри блока
      element.find('input[type!="submit"],select,textarea').each(function () {
        var el = $(this);
        var parentblockId = el.parents('[data-hex-block][data-hex-multy-item!="$"]:first').attr('id');
        //Инпут находится непосредственно внутри нашего блока
        if (parentblockId === block.id) {
          ownInputs.push(el);
        }
      });

      element.find('[data-hex-block][data-hex-multy-item!="$"]').each(function () {
        var testBlock = $(this);
        if (testBlock.parents('[data-hex-block][data-hex-multy-item!="$"]:first').attr('id') === block.id) {
          ownBlocks[testBlock.attr('id')] = testBlock;
        }
      });

      for (var b in ownBlocks) {
        block.addBlock(ownBlocks[b]);
      }
      addControls(ownInputs);
    }

    function initContainer() {
      block.id = element.attr('id');
      block.form = form;
      block.element = element;
      block.parent = parentBlock;
      if ($('[href="#' + block.id + '"]').size() > 0) {
        tab = $('[href="#' + block.id + '"]');
      }
      if (block.id === undefined) {
        throw new Error('[data-hex-block] must have id attr');
      }
      findChildrenBlocks();
    }


    initContainer();

  };
  return h;
}(hex || {}));

