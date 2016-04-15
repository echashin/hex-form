var hex = (function (h) {
  'use strict';
  h.widgets.select2 = function (control, config) {
    var input;
    var mode = 'local';

    function init() {
      input = control.getInputs()[0];
      var placeholder = config.placeholder || '';
      var defaultSettings = {
        theme: 'bootstrap',
        allowClear: true,
        placeholder: placeholder
      };

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
  };

  return h;
}(hex));
