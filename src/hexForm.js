var hex = (function (h) {
  'use strict';

  var hexForms = {};

  function HexForm(formId) {
    var hf = this;
    hf.errorText = 'Не удалось сохранить форму, попробуйте обновить страницу';
    hf.invalidText = 'Форма содержит ошибки';
    var form = $('#' + formId);
    var handlers = {};
    var dataType = 'formdata';
    hf.root = undefined;

    var formData = new FormData();
    var FormEvent = function (type) {
      this.type = type;
      this.stoped = false;
      this.stop = function () {
        this.stoped = true;
      };
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

    hf.trigger = function (eventName, params) {
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

    function getValues() {
      var data = JSON.parse(JSON.stringify(hf.root.getData()));
      return h.utils.clearValues(data);
    }


    hf.draw = function () {
      hf.root.render.draw();
    };

    function clearErrors() {
      form.find('.has-error').removeClass('has-error');
      form.find('.alerts div').remove();
    }

    function reset(event) {
      var dontBreakReset = hf.trigger('beforeReset', {values: getValues()});
      if (dontBreakReset) {
        window.setTimeout(function () {
          clearErrors();
          hf.root.reset();
        }, 1);
      } else {
        event.preventDefault();
      }
      hf.trigger('afterReset', {});
    }


    function setFormData(data, name) {
      var namespace = '';
      if (name !== undefined) {
        namespace = name;
      }
      for (var k in data) {
        var v = data[k];
        k += '';
        if (k.indexOf('$') !== 0) {
          var nameZ = k;
          if (namespace !== '') {
            nameZ = namespace + '[' + k + ']';
          }

          if ($.isArray(v) || $.isPlainObject(v)) {
            setFormData(v, nameZ);
          } else {
            formData.append(nameZ, v);
          }
        }
      }
    }

    var submit = function (event) {
      event.preventDefault();
      event.stopPropagation();
      var data = getValues();
      var dontBreakBeforeValidation = hf.trigger('beforeValidation', {values: data});
      if (!dontBreakBeforeValidation) {
        return false;
      }
      var formValid = hf.root.validate(true);

      if (formValid === true) {
        clearErrors();

        var dontBreakBefore = hf.trigger('beforeSubmit', {values: data});
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
            setFormData(data);
          } else {
            formData = data;
          }

          $.ajax({
            url: url,
            data: formData,
            type: method,
            dataType: 'json',
            processData: false,
            contentType: false,
            success: function (res) {
              var dontBreakAfter = hf.trigger('afterSubmit', res);
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
                  if (res.run !== undefined) {
                    var runFunc = new Function('form', res.run);
                    runFunc.call(null, hf);
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

    var init = function () {
      form.addClass('loader-container').append('<div class="loader"></div>');
      form.attr('data-hex-block', '');
      form.on('submit', submit);
      form.on('reset', reset);
      if (form.find('.loader').size() === 0) {
        form.append('<div class="loader"></div>');
      }

      if (form.data('datatype') !== undefined) {
        dataType = form.data('datatype');
      }

      hf.root = new h.Block(form);

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

  h.remove = function (formId) {
    if (hexForms[formId] !== undefined) {
      hexForms[formId] = undefined;
    }
  };

  $(document).ready(function () {
    h.form();
  });

  return h;
}(hex));

