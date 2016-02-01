/* global moment:true,swal:true*/
'use strict';
this.HexWidget = (function () {

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
    var input;

    function init(conf) {
      if (conf.input !== undefined) {
        input = conf.input;
        var localeData = moment.localeData();
        var defaultSettings = {
          'autoUpdateInput': false,
          'linkedCalendars': false,
          'singleDatePicker': true,
          'locale': {
            'format': localeData.longDateFormat('L'),
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

        var mask = defaultSettings.locale.format.replace(/[D]+/g, 'd').replace(/[M]+/g, 'm').replace(/[Y]+/g, 'y');
        if (defaultSettings.singleDatePicker === false) {
          mask += defaultSettings.locale.separator + mask;
        }
        input.inputmask(mask);
        input.daterangepicker(defaultSettings, function (start, end) {
          var value = start.format(defaultSettings.locale.format);
          if (defaultSettings.singleDatePicker === false) {
            value += defaultSettings.locale.separator + end.format(defaultSettings.locale.format);
          }
          input.val(value);
          input.trigger('blur');
        });
      }
    }

    init(config);
  }

  function Select2(config) {
    var input;

    function init(conf) {
      if (conf.input !== undefined) {
        input = conf.input;
        var defaultSettings = {
          theme: 'bootstrap'
        };
        $.extend(defaultSettings, conf);
        input.select2(defaultSettings);
      }
    }

    init(config);
  }

  function FileUpload(config) {
    var input, control;
    var tempValue = [];
    var thumbs;
    var limit;
    var button;
    var disabled = false;
    var controlValue = [];

    function disable() {
      disabled = true;
      button.attr('disabled', 'disabled').find('input').attr('disabled', 'disabled');
    }

    function enable() {
      disabled = false;
      button.removeAttr('disabled').find('input').removeAttr('disabled');
    }

    function change() {
      var tpl = '';
      $.each(tempValue, function (index, value) {
        tpl += '<li class="list-group-item clearfix">';
        if (value.thumbnailUrl !== undefined) {
          tpl += '<a target="_blank" href="' + value.url + '" class="thumbnail"><img width="50" src="' + value.thumbnailUrl + '"></a>';
        }
        tpl += value.name;
        tpl += '<button aria-label="Close" class="close" type="button"><span aria-hidden="true">×</span></button></li>';
      });
      thumbs.html(tpl);
      if (limit !== undefined) {
        if (tempValue.length >= limit) {
          disable();
        } else {
          enable();
        }
      }

      controlValue = [];
      $.each(tempValue, function (index, file) {
        if (file.id !== undefined) {
          controlValue.push(file);
        }
      });
      control.setValue(controlValue);
    }

    function init(conf) {
      if (conf.control !== undefined) {
        control = conf.control;
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

      if (conf.value !== undefined) {
        $.each(conf.value, function (index, file) {
          tempValue.push(file);
          controlValue.push(file);
        });

        change();
      }

      if (conf.input !== undefined) {
        input = conf.input;
        button = input.closest('.btn');
        if (config.params === undefined) {
          config.formData = {};
        } else {
          config.formData = config.params;
          delete config.params;
        }

        var defaultSettings = {
          dataType: 'json',
          paramName: 'files[]',
          dropZone: input.closest('.drop-zone'),
          autoUpload: false,
          acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i
        };

        $.extend(defaultSettings, config);


        thumbs = input.closest('.form-group').find('.hex-file-thumbs');

        thumbs.on('click', '.close', function () {
          var index = thumbs.find('li').index($(this).closest('li'));
          tempValue.splice(index, 1);
          change();
        });


        var uploader = input.fileupload(defaultSettings);

        uploader.bind('fileuploaddone', function (e, data) {
          var fIndex = 0;
          $.each(data.files, function (index, file) {
            fIndex = tempValue.indexOf(file);
          });
          $.each(data.result.files, function (index, file) {
            tempValue[fIndex] = file;
          });
          change();
        });
        uploader.bind('fileuploadprocessfail', function () {
          swal('Ошибка!', 'Не удалось загрузить файл', 'error');
        });
        uploader.bind('fileuploadprocessalways', function (e, data) {
          var currentFile = data.files[data.index];
          if (data.files.error && currentFile.error) {
            swal('Ошибка!', currentFile.error, 'error');
          } else {
            tempValue.push(currentFile);
            change();
            data.process().done(function () {
              data.submit();
            });
          }
        });

        uploader.bind('fileuploadadd', function () {
          if (limit !== undefined && limit < tempValue.length) {
            disable();
            swal('Ошибка!', 'Не более ' + limit + ' файлов', 'error');
            return false;
          }
        });

      }
    }

    init(config);
  }

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
        case 'fileupload':
        {
          return new FileUpload(conf);
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


