/* global moment:true*/
var hex = (function (h) {
  'use strict';
  var locale = $('html').attr('lang');
  if (h.utils.isEmpty(locale)) {
    throw new Error('Doesn`t set lang attr in html tag');
  }
  moment.locale(locale.toLowerCase());
  h.widgets.date = function (control, config) {
    var input;
    var parentMin = false;
    var parentMax = false;
    var minDate = false;
    var maxDate = false;

    function init() {
      input = control.getInputs()[0];
      var localeData = moment.localeData();
      var localeFormat = localeData.longDateFormat('L');
      if (config.timePicker !== undefined && config.timePicker === true) {
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
      if (config.parentMin !== undefined) {
        minDate = $(config.parentMin).val();
        if (!h.utils.isEmpty(minDate)) {
          defaultSettings.minDate = minDate;
        }
        parentMin = config.parentMin;
        delete config.parentMin;
      }

      if (config.parentMax !== undefined) {
        maxDate = $(config.parentMax).val();
        if (!h.utils.isEmpty(maxDate)) {
          defaultSettings.maxDate = maxDate;
        }
        parentMax = config.parentMax;
        delete config.parentMax;
      }

      $.extend(defaultSettings, config);

      var mask = defaultSettings.locale.format.replace(/[H]/g, '9').replace(/[m]/g, '9').replace(/[D]+/g, 'd').replace(/[M]+/g, 'm').replace(/[Y]+/g, 'y');
      if (defaultSettings.singleDatePicker === false) {
        mask += defaultSettings.locale.separator + mask;
      }
      input.inputmask(mask);


      var onChange = function () {
        var picker = input.data('daterangepicker');
        var value = picker.startDate.format(defaultSettings.locale.format);
        if (defaultSettings.singleDatePicker === false) {
          value += defaultSettings.locale.separator + picker.endDate.format(defaultSettings.locale.format);
        }
        input.val(value).trigger('change');
      };

      //Инициализация

      input.daterangepicker(defaultSettings);

      input.on('apply.daterangepicker', function () {
        onChange();
      });


      //input.change(onChange);
      var parentMaxChange = function () {
        maxDate = $(parentMax).val();
        if (h.utils.isEmpty(maxDate)) {
          control.disable();
          input.val('').trigger('change');
        } else {
          defaultSettings.maxDate = maxDate;
          input.daterangepicker(defaultSettings);
          input.on('apply.daterangepicker', function () {
            onChange();
          });

          control.enable();
          if (h.utils.isEmpty(input.val())) {

            if (!h.utils.isEmpty(minDate)) {
              input.data('daterangepicker').setStartDate(minDate);
              input.data('daterangepicker').setEndDate(minDate);
            } else {
              input.data('daterangepicker').setStartDate(maxDate);
              input.data('daterangepicker').setEndDate(maxDate);
            }
          }
          onChange();
        }
      };

      var parentMinChange = function () {
        minDate = $(parentMin).val();
        if (h.utils.isEmpty(minDate)) {
          control.disable();
          input.val('').trigger('change');
        } else {
          defaultSettings.minDate = minDate;
          input.daterangepicker(defaultSettings);
          input.on('apply.daterangepicker', function () {
            onChange();
          });
          control.enable();
          if (h.utils.isEmpty(input.val())) {
            input.data('daterangepicker').setStartDate(minDate);
            input.data('daterangepicker').setEndDate(minDate);
          }
          onChange();
          if (parentMax !== false) {
            parentMaxChange();
          }
        }
      };



      if (parentMin !== false) {
        $(parentMin).on('change', function () {
          parentMinChange();
        });
      }

      if (parentMax !== false) {
        $(parentMax).on('change', function () {
          parentMaxChange();
        });
      }
      if (parentMax !== false) {
        parentMaxChange();
      }
      if (parentMin !== false) {
        parentMinChange();
      }


    }


    init();
  };

  return h;
}(hex));
