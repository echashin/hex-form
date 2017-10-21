var hex = (function (h) {
  'use strict';

  jQuery.fn.rVal = jQuery.fn.val;
  jQuery.fn.val = function (value) {
    var assoc = this.attr('data-hex-select-assoc');
    if (typeof assoc !== typeof undefined) {
      return this.get(0).assocVal(value);
    }
    return this.rVal.apply(this, arguments);
  };

  h.widgets.select2 = function (control, config) {
    var input;
    var mode = 'local';


    function getAssoc() {

      var data = input.select2('data');
      var res = [];
      for (var i in data) {
        res.push({id: data[i].id, text: data[i].text});
      }
      return res;
    }

    function setAssoc(val) {
      if ($.isArray(val)) {
        var newVal = [];
        var isChanged = false;
        for (var i in val) {
          if($.isPlainObject(val[i])) {
            newVal.push(val[i].id);
            if (input.find('option[value="' + val[i].id + '"]').length === 0) {
              var newOption = new Option(val[i].text + '', val[i].id + '', true, true);
              input.append(newOption);
              isChanged = true;
            }
          }else{
            newVal.push(val[i]);
          }
        }
        if (isChanged) {
          input.trigger({
            type: 'select2:select',
            params: {
              data: val
            }
          });
        }
        input.rVal(newVal);
      } else {
        input.rVal(val);
      }
      return input;
    }


    function init() {
      input = control.getInputs()[0];

      input.get(0).assocVal = function (val) {
        if (val !== undefined) {
          return setAssoc(val);
        } else {
          return getAssoc();
        }
      };

      if (config.templateSelection !== undefined) {
        config.templateSelection = window[config.templateSelection];
      }
      if (config.templateResult !== undefined) {
        config.templateResult = window[config.templateResult];
      }


      var placeholder = config.placeholder || '';
      var defaultSettings = {
        theme: 'bootstrap',
        allowClear: true,
        placeholder: placeholder,
        minimumResultsForSearch: 10
      };

      if (config.data !== undefined) {
        var dParams = config.data.split('::');
        var ns = dParams[0];
        var dataObj = input.closest('[data-hex-block]').get(0).getBlock().getData();
        if (dParams[1] !== undefined) {
          var filter = window[dParams[1]];
          config.data = filter(h.utils.objectProperty(dataObj, ns));
        } else {
          config.data = h.utils.objectProperty(dataObj, ns);
        }


      }


      if (config.url !== undefined) {
        mode = 'ajax';
        var selected = input.find('option[selected]');
        config.ajax = {
          url: config.url,
          method: 'POST',
          dataType: 'json',
          delay: 250,
          data: function (params) {
            return {
              search: params.term, // search term
              page: params.page
            };
          },
          processResults: function (data, params) {
            params.page = params.page || 1;
            return {
              results: data.rows,
              pagination: {
                more: (params.page * data.limit) < data.total
              }
            };
          },
          cache: false
        };


        delete config.url;

        if (config.parent !== undefined) {
          var pId = config.parent.selector;
          var paramName = config.parent.param || 'parent_id';
          if (h.utils.isEmpty($(pId).val())) {
            control.disable();
            input.val('').trigger('change');
          }

          $(pId).on('change', function () {
            if (h.utils.isEmpty($(this).val())) {
              control.disable();
              input.val('').trigger('change');
            } else {
              control.enable();
              input.val('').trigger('change');
            }
          });
          delete config.parent;

          var parentId = function () {
            return $(pId).val();
          };

          config.ajax.data = function (params) {
            var requestParams = {
              search: params.term, // search term
              page: params.page
            };
            requestParams[paramName] = parentId;
            return requestParams;
          };
        }
      }

      $.extend(defaultSettings, config);
      //enable select2 plugin
      input.select2(defaultSettings);
      if (mode === 'ajax') {
        selected.each(function () {
          input.append($(this));
        });
        input.trigger('change');
      }
    }

    init();

    //return {getAssoc: getAssoc, setAssoc: setAssoc}
  };

  return h;
}(hex));
