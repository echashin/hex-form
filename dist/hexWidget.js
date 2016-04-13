/* global moment:true, dragula:true, Flow:true*/

var HexWidget = (function () {
  'use strict';
  function isEmpty(v) {
    if (v === null || v === false || v === undefined || v === '' || ($.isArray(v) && v.length === 0)) {
      return true;
    } else {
      return false;
    }
  }

  function PasswordShow(config) {
    var button, input;
    var currentType = 'password';

    function init(conf) {
      if (conf.input !== undefined) {
        input = conf.input;
        button = input.closest('.form-group').find('button.password-show');
        button.bind('click', function (event) {
          event.preventDefault();
          if (currentType === 'password') {
            input.attr('type', 'text');
            button.addClass('active');
            currentType = 'text';
          } else {
            input.attr('type', 'password');
            button.removeClass('active');
            currentType = 'password';
          }
          input.focus();
          return false;
        });
      }
    }

    init(config);
  }

  function PasswordStrength(config) {
    var self = this;

    var input, passMeter;
    var events = ['change'];
    var characters = 0;
    var capitalletters = 0;
    var loweletters = 0;
    var number = 0;
    var special = 0;

    var upperCase = new RegExp('[A-ZА-Я]');
    var lowerCase = new RegExp('[a-zа-я]');
    var numbers = new RegExp('[0-9]');
    var specialchars = new RegExp('([!,%,&,@,#,$,^,*,?,_,~])');

    function checkStrength(value) {
      if (value.length > 8) {
        characters = 1;
      } else {
        characters = 0;
      }

      if (value.match(upperCase)) {
        capitalletters = 1;
      } else {
        capitalletters = 0;
      }

      if (value.match(lowerCase)) {
        loweletters = 1;
      } else {
        loweletters = 0;
      }

      if (value.match(numbers)) {
        number = 1;
      } else {
        number = 0;
      }

      if (value.match(specialchars)) {
        special = 1;
      } else {
        special = 0;
      }
      return characters + capitalletters + loweletters + number + special;
    }

    self.weight = 0;

    self.setEvents = function (e) {
      events = e;
    };

    self.getEvents = function () {
      return events;
    };

    function init(conf) {
      if (conf.events !== undefined) {
        self.setEvents(conf.events);
      }
      if (conf.input !== undefined) {
        input = conf.input;
        passMeter = input.closest('.form-group').find('.password-strength div');
        input.bind('keyup change', function () {
          var value = input.val();
          passMeter.attr('class', 's-' + checkStrength(value));
        });
      }
    }

    init(config);
  }

  function DateWidget(config) {
    var input, control;

    function init(conf) {
      if (conf.input !== undefined) {
        input = conf.input;
        delete conf.input;
        control = conf.control;
        delete conf.control;
        var localeData = moment.localeData();
        var localeFormat = localeData.longDateFormat('L');
        if (conf.timePicker !== undefined && conf.timePicker === true) {
          localeFormat += ' ' + localeData.longDateFormat('LT');
        }


        var defaultSettings = {
          'autoUpdateInput': false,
          'linkedCalendars': false,
          'singleDatePicker': true,

          'locale': {
            'format': localeFormat,
            'separator': ' - ',
            'applyLabel': 'Готово',
            'cancelLabel': 'Отмена',
            'fromLabel': 'От',
            'toLabel': 'До',
            'customRangeLabel': 'Custom',
            'daysOfWeek': moment.weekdaysShort(),
            'monthNames': moment.months(),
            'firstDay': localeData.firstDayOfWeek()
          }
        };





        $.extend(defaultSettings, conf);


        var mask = defaultSettings.locale.format.replace(/[H]/g, '9').replace(/[m]/g, '9').replace(/[D]+/g, 'd').replace(/[M]+/g, 'm').replace(/[Y]+/g, 'y');
        if (defaultSettings.singleDatePicker === false) {
          mask += defaultSettings.locale.separator + mask;
        }
        input.inputmask(mask);

        input.daterangepicker(defaultSettings);

        input.on('apply.daterangepicker', function (ev, picker) {
          var value = picker.startDate.format(defaultSettings.locale.format);
          if (defaultSettings.singleDatePicker === false) {
            value += defaultSettings.locale.separator + picker.endDate.format(defaultSettings.locale.format);
          }
          input.val(value);
          input.trigger('change');
        });

        if (conf.parent !== undefined) {
          var pId = conf.parent;
          $(pId).on('change', function () {
            var parentVal = $(pId).val();
            if (isEmpty(parentVal)) {
              control.disable();
              input.val('').trigger('change');
            } else {
              defaultSettings.minDate = parentVal;
              input.daterangepicker(defaultSettings);
              input.on('apply.daterangepicker', function (ev, picker) {
                var value = picker.startDate.format(defaultSettings.locale.format);
                if (defaultSettings.singleDatePicker === false) {
                  value += defaultSettings.locale.separator + picker.endDate.format(defaultSettings.locale.format);
                }
                input.val(value);
                input.trigger('change');
              });
              control.enable();
              input.data(defaultSettings);
            }
          });
        }


      }
    }

    init(config);
  }

  function Select2(config) {
    var input, control;
    var mode = 'local';

    function init(conf) {
      if (conf.control !== undefined) {
        control = conf.control;
      }

      if (conf.input !== undefined) {
        input = conf.input;
        var placeholder = conf.placeholder || '';
        var defaultSettings = {
          theme: 'bootstrap',
          allowClear: true,
          placeholder: placeholder
        };

        if (conf.url !== undefined) {
          mode = 'ajax';
          var selected = input.find('option[selected]');
          conf.ajax = {
            url: conf.url,
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
          delete conf.url;

          if (conf.parent !== undefined) {
            var pId = conf.parent.selector;
            var paramName = conf.parent.param || 'parent_id';
            if (isEmpty($(pId).val())) {
              control.disable();
              input.val('').trigger('change');
            }

            $(pId).on('change', function () {
              if (isEmpty($(this).val())) {
                control.disable();
                input.val('').trigger('change');
              } else {
                control.enable();
              }
            });
            delete conf.parent;

            var parentId = function () {
              return $(pId).val();
            };

            conf.ajax.data = function (params) {
              var requestParams = {
                search: params.term, // search term
                page: params.page
              };
              requestParams[paramName] = parentId;
              return requestParams;
            };
          }
        }

        $.extend(defaultSettings, conf);
        //enable select2 plugin
        input.select2(defaultSettings);
        if (mode === 'ajax') {
          selected.each(function () {
            input.append($(this));
          });
          input.trigger('change');
        }


      }
    }

    init(config);
  }

  function FileSimple(config) {
    var input, control, files;

    function init(conf) {
      function prepareUpload(event) {
        files = event.target.files[0];
        control.setValue(files);
      }

      input = conf.input;
      control = conf.control;
      input.bind('change', prepareUpload);
    }

    init(config);
  }

  function Mask(config) {
    var input;

    function init(conf) {
      input = conf.input;
      input.inputmask(conf.mask);
    }

    init(config);
  }

  /*
   function FileUpload(config) {
   var input, control, url, flow;
   var allowedTypes;
   var thumbs;
   var limit;
   var single = false;
   var button;
   var disabled = false;
   var thumbSample;
   var files = [];

   function disable() {
   disabled = true;

   }

   function enable() {
   disabled = false;

   }

   function change() {


   }

   function addFile(file, name) {
   var newThumb = thumbSample.clone();
   control.form.hexBind(newThumb, {'@name': name, '@thumb': '<i class="upload-loader"></i>', '@link': ''});
   if (input.closest('.form-group').find('[data-hex-thumb]').size() === 0) {
   input.closest('.form-group').find('.upload-dropzone').prepend(newThumb);
   } else {
   newThumb.insertAfter(input.closest('.form-group').find('[data-hex-thumb]').last());
   }
   files.push({'file': file, 'html': newThumb});
   }

   function markError(file, message) {
   for (var i in files) {
   if (files[i].file === file) {
   control.form.hexBind(files[i].html, {'@thumb_preview': '<div class="upload-error">' + message + '</div>'});
   var delHtml = files[i].html;
   flow.removeFile(files[i].file);
   files.splice(i, 1);
   var tm = setTimeout(function () {
   delHtml.fadeOut(function () {
   delHtml.remove();
   });
   }, 3000);
   break;
   }
   }
   }

   function removeFile(html) {
   for (var i in files) {
   if (files[i].html === html) {
   if (files[i].file !== undefined) {
   flow.removeFile(files[i].file);
   }
   files.splice(i, 1);

   }
   break;
   }
   html.fadeOut(function () {
   html.remove();
   });
   }


   function init(conf) {
   if (conf.control !== undefined) {
   control = conf.control;
   }
   if (conf.types !== undefined) {
   allowedTypes = [];
   var reg = /$[\.]/;
   for (var t in conf.types) {
   var type = conf.types[t];
   if (!reg.test(type)) {
   type = '.' + type;
   }
   allowedTypes.push(type);
   }

   }
   if (conf.single === true) {
   single = true;
   }

   if (conf.limit !== undefined) {
   limit = parseInt(conf.limit);
   if (isNaN(limit)) {
   limit = 1;
   }
   if (limit === 0) {
   limit = undefined;
   }
   delete conf.limit;
   }

   if (conf.input !== undefined) {
   input = conf.input;
   }
   if (conf.url !== undefined) {
   url = conf.url;
   } else {
   throw new Error('doesnt set url paremetr on ' + control.name);
   }

   var flowParams = {
   target: url,
   singleFile: single
   };

   flow = new Flow(flowParams);

   if (input.closest('.form-group').find('[data-hex-thumb]').size() > 0) {
   input.closest('.form-group').find('[data-hex-thumb]').each(function () {
   var data = $(this).data('hexThumb');
   if (data === '') {
   thumbSample = $(this).clone(false);
   $(this).remove();
   } else {
   files.push({'html': $(this)});
   }
   });
   }
   input.closest('.form-group').on('click', '[data-hex-remove]', function (event) {
   event.preventDefault();
   var thumb = $(this).closest('.upload-thumb');
   removeFile(thumb);
   return false;
   });
   if (single) {
   dragula([input.closest('.form-group').find('.upload-dropzone')[0]], {
   'mirrorContainer': input.closest('.form-group').find('.upload-dropzone')[0],
   direction: 'horizontal'
   });
   }

   if (flow.support) {
   var browseParams = {};
   if (allowedTypes !== undefined) {
   browseParams.accept = allowedTypes.join(',');
   }

   flow.assignBrowse(input.closest('.form-group').find('.upload-btn')[0], false, single, browseParams);
   flow.assignDrop(input.closest('.form-group').find('.upload-dropzone')[0]);
   flow.on('fileAdded', function (file, event) {
   var valid = true;
   if (allowedTypes !== undefined) {
   if (allowedTypes.indexOf('.' + file.getType()) < 0) {
   valid = false;
   }
   }
   if (valid) {
   addFile(file, file.name);
   } else {
   alert('"' + file.name + '" - неверный тип файла. Разрешены файлы типа: ' + allowedTypes.join(', '));
   }
   return valid;
   });
   flow.on('fileSuccess', function (file, message) {
   //console.log(file, message);
   });
   flow.on('fileError', function (file, message) {
   markError(file, message);
   });
   flow.on('filesSubmitted', function (file) {
   flow.upload();
   });
   }

   }

   init(config);
   }
   */

  function Phone(config) {
    var input;

    function init(conf) {
      if (conf.input !== undefined) {
        input = conf.input;
        input.inputmask('+7(999)999-99-99');
      }
    }

    init(config);
  }

  function Widget(config) {
    function init(conf) {
      switch (conf.type) {
        case 'password-strength':
        {
          return new PasswordStrength(conf);
        }
        case 'password-show':
        {
          return new PasswordShow(conf);
        }
        case 'date':
        {
          return new DateWidget(conf);
        }
        case 'phone':
        {
          return new Phone(conf);
        }
        case 'select2':
        {
          return new Select2(conf);
        }
        case 'mask':
        {
          return new Mask(conf);
        }
        /*
         case 'fileupload':
         {
         return new FileUpload(conf);
         }*/
        case 'filesimple':
        {
          return new FileSimple(conf);
        }
        default :
        {
          throw new Error('Unfinded widget: ' + conf.type);
        }
      }
    }

    return init(config);
  }


  return Widget;
})();
