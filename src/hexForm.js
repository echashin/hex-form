var hex = (function (h) {
  'use strict';

  var hexForms = {};

  function HexForm(formId) {
    var hf = this;
    hf.controls = [];
    hf.errorText = 'Не удалось сохранить форму, попробуйте обновить страницу';
    hf.invalidText = 'Форма содержит ошибки';
    var form = $('#' + formId);
    var handlers = {};
    var dataType = 'formdata';
    hf.mainBlock = undefined;

    var FormEvent = function (type) {
      this.type = type;
      this.stoped = false;
      this.stop = function () {
        this.stoped = true;
      };
    };

    hf.removeBlock = function (blockId) {
      var block = hf.mainBlock.findBlockById(blockId);
      if (block === false) {
        return false;
      }
      for (var c in block.controls) {
        var control = block.controls[c];
        var formControl = hf.findControlByName(control.name);
        if (formControl !== false) {
          hf.controls.splice(hf.controls.indexOf(formControl), 1);
        }
      }
      block.controls = [];
      block.element.remove();
      if (block.parent !== undefined) {
        for (var b in block.parent.childBlocks) {
          if (block.parent.childBlocks[b] === block) {
            block.parent.childBlocks.splice(b, 1);
          }
        }
      }
      hf.mainBlock.isValid(false);
    };

    hf.findControlByName = function (cName) {
      for (var i in hf.controls) {
        if (hf.controls[i].name === cName) {
          return hf.controls[i];
        }
      }
      return false;
    };

    hf.on = function (eventName, fn) {
      if (handlers[eventName] === undefined) {
        handlers[eventName] = [];
      }
      if (handlers[eventName].indexOf(fn) < 0) {
        handlers[eventName].push(fn);
      }
    };

    hf.off = function (eventName, fn) {
      if (handlers[eventName] !== undefined) {
        handlers[eventName].splice(handlers[eventName].indexOf(fn), 1);
      }
    };

    hf.fire = function (eventName, params) {
      if (handlers[eventName] !== undefined) {
        var formEvent = new FormEvent(eventName);
        for (var fnIndex in handlers[eventName]) {
          var func = handlers[eventName][fnIndex];
          func(params, formEvent);
        }
        return !formEvent.stoped;
      } else {
        return true;
      }
    };

    hf.getHandlers = function () {
      return handlers;
    };


    var getValues = function () {
      var values = {};
      for (var i in hf.controls) {
        if (hf.controls.hasOwnProperty(i)) {
          if (hf.controls[i].disabled === false) {
            var name = hf.controls[i].name;
            var value = hf.controls[i].getValue();
            if (value === null || ($.isArray(value) && value.length === 0)) {
              value = '';
            } else {
              values[name] = value;
            }
          }
        }
      }
      return values;
    };


    var reset = function (event) {
      var dontBreakReset = hf.fire('beforeReset', {values: hf.getValues()});
      if (dontBreakReset) {
        window.setTimeout(function () {
          for (var i in hf.controls) {
            if (hf.controls.hasOwnProperty(i)) {
              hf.controls[i].reset();
            }
          }
          form.find('.has-error').removeClass('has-error');
          form.find('.alerts .alert').remove();
        }, 1);
      } else {
        event.preventDefault();
      }
      hf.fire('afterReset', {});
    };
    var clearErrors = function () {
      form.find('.has-error').removeClass('has-error');
      form.find('.alerts div').remove();
    };

    var submit = function (event) {
      event.preventDefault();
      event.stopPropagation();
      var formValid = hf.mainBlock.isValid();

      if (formValid === true) {
        clearErrors();
        var data = getValues();
        var dontBreakBefore = hf.fire('beforeSubmit', {values: data});
        if (dontBreakBefore) {
          hf.loaderShow();
          var url = form.attr('action');
          /*Отправка на разные URL аттрибут data-action*/
          var submitBtn = form.find('button[type=submit]:focus');
          if (submitBtn.size() > 0) {
            if (submitBtn.attr('data-action') !== undefined) {
              url = submitBtn.attr('data-action');
            }
          }
          var method = 'POST';

          if (form.attr('method') !== undefined) {
            method = form.attr('method');
          }

          if (dataType === 'formdata') {
            var formData = new FormData();
            $.each(data, function (k, v) {
              if ($.isArray(v) || $.isPlainObject(v)) {
                for (var j in v) {
                  if (v[j] !== null && v[j] !== false && v[j] !== undefined) {
                    formData.append(k, v[j]);
                  }
                }
              } else {
                formData.append(k, v);
              }
            });
          }


          $.ajax({
            url: url,
            data: formData,
            type: method,
            dataType: 'json',
            processData: false,
            contentType: false,
            success: function (res) {
              var dontBreakAfter = hf.fire('afterSubmit', res);
              if (dontBreakAfter) {
                window.setTimeout(function () {
                  if (res.success === true) {
                    clearErrors();
                    if (res.reload !== undefined) {
                      if (res.reload === true) {
                        window.location.href = window.location.href;
                      } else {
                        window.location.href = res.reload;
                      }
                    } else {
                      hf.loaderHide();
                    }
                  } else {
                    hf.loaderHide();
                  }
                  if (res.alerts !== undefined) {
                    for (var m in res.alerts) {
                      var message = res.alerts[m];
                      form.find('.alerts').append($('<div>').addClass('alert alert-' + message.type).html(message.text));
                    }
                    hf.loaderHide();
                  }
                }, 1);
              }
            },
            error: function () {
              hf.loaderHide();
              form.find('.alerts').append($('<div>').addClass('alert alert-danger').html(hf.errorText));
            }
          });
        }
      } else {
        form.find('.alerts div').remove();
        form.find('.alerts').append($('<div>').addClass('alert alert-danger').html(hf.invalidText));
      }
      return false;
    };

    hf.loaderShow = function () {
      form.find('.loader').show();
    };
    hf.loaderHide = function () {
      form.find('.loader').hide();
    };

    hf.submit = function () {
      submit();
    };
    hf.getValues = function () {
      return getValues();
    };

    function hexDisabled(panel) {
      if (panel.parents('[data-hex-multy-item="$"]').size() > 0) {
        return false;
      }


      var currentBlockId = panel.closest('[data-hex-block]').attr('id');
      var currentBlock = hf.mainBlock.findBlockById(currentBlockId);

      var data = panel.data('hexDisabled');

      var searchValue = data.value;
      var control = hf.findControlByName(data.control);
      if (control === undefined) {
        throw new Error('Control "' + data.control + '" not found');
      }
      function onChange() {
        currentBlock.isValid(false);
        var v = control.getValue();
        var expSuccess = false;
        if (v === null || v === false || v === undefined || v === '' || ($.isArray(v) && v.length === 0)) {
          expSuccess = false;
        } else {
          if (typeof v === 'string') {
            if (v === searchValue) {
              expSuccess = true;
            }
          }
          if (typeof v === 'object') {
            if (v.indexOf(searchValue) >= 0) {
              expSuccess = true;
            }
          }
        }

        if (!expSuccess) {
          panel.hide();
          panel.find('input[type!="submit"],select,textarea').trigger('disable');
        } else {
          panel.show();
          panel.find('input[type!="submit"],select,textarea').trigger('enable');
        }
      }

      control.addEvent('change', onChange);
      control.trigger('change');
    }

    function convertDataName(name) {
      return name.replace('-', '').toUpperCase();
    }

    hf.hexBind = function (block, params) {
      var nodes = [];
      nodes.push(block);
      block.find('[data-hex-bind]').each(function () {
        nodes.push($(this));
      });
      function expr(ex) {
        var chars = ex.split('');
        var nn = [], op = [], index = 0, oplast = true;
        nn[index] = '';
        // Parse the expression
        for (var c = 0; c < chars.length; c++) {
          if (isNaN(parseInt(chars[c])) && chars[c] !== '.' && !oplast) {
            op[index] = chars[c];
            index++;
            nn[index] = '';
            oplast = true;
          } else {
            nn[index] += chars[c];
            oplast = false;
          }
        }

        // Calculate the expression
        ex = parseFloat(nn[0]);
        for (var o = 0; o < op.length; o++) {
          var num = parseFloat(nn[o + 1]);
          switch (op[o]) {
            case '+':
              ex = ex + num;
              break;
            case '-':
              ex = ex - num;
              break;
            case '*':
              ex = ex * num;
              break;
            case '/':
              ex = ex / num;
              break;
          }
        }

        return ex;
      }

      function appendParams(template) {
        if (typeof template === 'object') {
          for (var i in template) {
            template[i] = appendParams(template[i]);
          }
        } else {
          for (var p in params) {
            template = template.replace(new RegExp(p, 'g'), params[p]);
          }
          if (/\%/.test(template)) {
            template = template.replace(/\%(.*?)\%/g, function (value) {
              return expr(value.replace(/\%/g, ''));
            });
          }
        }
        return template;
      }

      for (var n in nodes) {
        var bParams = nodes[n].data('hexBind');
        for (var attr in bParams) {
          var tpl = appendParams(bParams[attr]);
          if (attr !== 'html') {
            if (/^data/.test(attr)) {
              var dataParamName = attr.replace(/^data-/, '');
              dataParamName = dataParamName.replace(/(\-[a-z])/g, convertDataName);
              nodes[n].data(dataParamName, tpl);
            }
            if (attr === 'name') {
              var oldName = nodes[n].attr('name');
              var fControl = hf.findControlByName(oldName);
              if (fControl !== false) {
                fControl.name = tpl;
              }
            }

            if (attr === 'id' && n <= 0) {

              var currentBlock = hf.mainBlock.findBlockById(nodes[n].attr('id'));

              if (currentBlock !== false) {
                currentBlock.id = tpl;
              } else {
                console.log('block not found id:' + nodes[n].attr('id'));
              }
            }
            if (typeof tpl === 'object') {
              nodes[n].attr(attr, JSON.stringify(tpl));
            } else {
              nodes[n].attr(attr, tpl);
            }
          } else {
            nodes[n].html(tpl);
          }
        }

      }
    };

    function multy(block) {
      var multyConf = block.data('hex-multy');

      var tabs, baseTab;
      var allowNull = false;
      if (multyConf.allow_empty !== undefined && multyConf.allow_empty === true) {
        allowNull = true;
      }

      if (block.find('[data-hex-multy-tabs]').size() > 0) {
        tabs = block.find('[data-hex-multy-tabs]');
        baseTab = tabs.find('[data-hex-multy-tab="$"]').clone(false);

        tabs.find('[data-hex-multy-tab="$"]').remove();
      }


      var firstBlock = block.find('[data-hex-multy-item="$"]');
      var baseBlock = firstBlock.clone(false);
      firstBlock.remove();

      function updateItemIndex(item, newIndex) {
        hf.hexBind(item, {'@index': newIndex});
      }

      function multyCheck() {
        if (allowNull === false) {
          var items = block.find('[data-hex-multy-item]');
          if (items.size() <= 1) {
            block.find('[data-hex-multy-remove]').attr('disabled', 'disabled');
          } else {
            block.find('[data-hex-multy-remove]').removeAttr('disabled');
          }
        }
      }


      block.on('click', '[data-hex-multy-add]', function () {
        var items = block.find('[data-hex-multy-item]');
        var newIndex = items.size();
        var clonedFieldset = baseBlock.clone(false);


        clonedFieldset.find('[data-hex-multy-hide]').remove();
        clonedFieldset.find('[data-hex-multy-attr]').each(function () {
          var element = $(this);
          var attrConf = element.data('hex-multy-attr');
          if (attrConf.add !== undefined) {
            $.each(attrConf.add, function (i, attr) {
              for (var aName in attr) {
                element.attr(aName, attr[aName]);
              }
            });
          }
          if (attrConf.remove !== undefined) {
            for (var a in attrConf.remove) {
              element.removeAttr(attrConf.remove[a]);
            }
          }
        });


        var pId = block.find('[data-hex-multy-items]').closest('[data-hex-block]').attr('id');
        var parentBlock = hf.mainBlock.findBlockById(pId);
        //Добавляем табы в DOM
        if (tabs !== undefined) {
          var clonedTab = baseTab.clone(false);
          if (block.find('[data-hex-multy-tab]:last').size() > 0) {
            clonedTab.insertAfter(block.find('[data-hex-multy-tab]:last'));
          } else {
            tabs.prepend(clonedTab);
          }
          updateItemIndex(clonedTab, newIndex);
        }

        //Обновляем данные в клонированном блоке
        updateItemIndex(clonedFieldset, newIndex);
        //Добавляем блок в DOM
        clonedFieldset.appendTo(block.find('[data-hex-multy-items]'));

        //Прицепляем блок к дереву блоков
        parentBlock.addBlock(clonedFieldset);


        if (tabs !== undefined) {
          $('a[href="#' + clonedFieldset.attr('id') + '"]').trigger('click');
        }
        //Запускаем hexDisabled
        if (clonedFieldset.find('[data-hex-disabled]').size() > 0) {
          clonedFieldset.find('[data-hex-disabled]').each(function () {
            hexDisabled($(this));
          });
        }
        multyCheck();
      });

      block.on('click', '[data-hex-multy-remove]', function () {
          var item = $(this).closest('[data-hex-multy-item]');
          var removedIndex = item.data('hexMultyItem');
          item.fadeOut(500, function () {
            hf.removeBlock(item.attr('id'));
            var items = block.find('[data-hex-multy-item]');
            items.each(function () {
              if ($(this).data('hexMultyItem') > removedIndex) {
                updateItemIndex($(this), $(this).data('hexMultyItem') - 1);
              }
            });
            if (tabs !== undefined) {
              tabs.find('[data-hex-multy-tab="' + removedIndex + '"]').remove();
              tabs.find('[data-hex-multy-tab]').each(function () {
                if ($(this).data('hexMultyTab') > removedIndex) {
                  updateItemIndex($(this), $(this).data('hexMultyTab') - 1);
                }
              });
              if (tabs.find('[data-hex-multy-tab=' + removedIndex + ']').size() > 0) {
                tabs.find('[data-hex-multy-tab=' + removedIndex + ']').find('a[role="tab"]').trigger('click');
              } else {
                if (tabs.find('[data-hex-multy-tab]:nth-child(' + (removedIndex) + ')').size() > 0) {
                  tabs.find('[data-hex-multy-tab]:nth-child(' + (removedIndex ) + ')').find('a[role="tab"]').trigger('click');
                }
              }
            }
            multyCheck();
            console.log(hf);
          });

        }
      );

      multyCheck();
    }


    var init = function () {
      form.addClass('loader-container').append('<div class="loader"></div>');
      form.attr('data-hex-block', '');
      form.on('submit',submit);
      form.on('reset',reset);
      if (form.find('.loader').size() === 0) {
        form.append('<div class="loader"></div>');
      }

      if(form.data('datatype')!==undefined){
        dataType=form.data('datatype');
      }

      hf.mainBlock = new h.Block(form, hf);
      if (form.find('[data-hex-multy]').size() > 0) {
        form.find('[data-hex-multy]').each(function () {
          multy($(this));
        });
      }

      if (form.find('[data-hex-disabled]').size() > 0) {
        form.find('[data-hex-disabled]').each(function () {
          hexDisabled($(this));
        });
      }
    };

    init();
    return hf;
  }

  h.form = function (id) {
    if (id === undefined) {
      var forms = $('form.hex-form');
      forms.each(function () {
        var formId = $(this).attr('id');
        if (formId === undefined) {
          throw new Error('Form dont have id attr');
        } else {
          if (hexForms[formId] === undefined) {
            hexForms[formId] = new HexForm(formId);
          }
        }
      });
    } else {
      if (hexForms[id] === undefined) {
        hexForms[id] = new HexForm(id);
      }
      return hexForms[id];
    }
    return hexForms;
  };

  $(document).ready(function () {

    h.form();
  });

  return h;
}(hex));

