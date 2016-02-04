/* global Inputmask:true*/
'use strict';
this.HexValidator = (function () {
  function Required(config) {
    var self = this;
    var events = ['blur'];
    self.weight = 0;
    var className = 'required';

    self.getClassName = function () {
      return className;
    };

    self.setEvents = function (val) {
      events = val;
    };

    self.getEvents = function () {
      return events;
    };

    function init(conf) {
      if (conf.events !== undefined) {
        self.setEvents(conf.events);
      }
    }

    self.isValid = function (value) {
      if (value === null || value === false || value === undefined || value === '' || ($.isArray(value) && value.length === 0)) {
        return false;
      } else {
        return true;
      }
    };
    init(config);
  }

  function DateValidator(config) {
    var self = this;
    var events = ['change', 'keyup', 'blur'];
    self.weight = 3;
    var input;
    var className = 'date';

    self.getClassName = function () {
      return className;
    };

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
      }

    }

    self.isValid = function (value) {
      if (value === '' || value === undefined || value === false) {
        return true;
      }
      var mask = input.inputmask('option', 'mask');
      return Inputmask.isValid(input.val(), {alias: mask});
    };
    init(config);
  }

  function Email(config) {
    var self = this;
    var className = 'email';
    self.getClassName = function () {
      return className;
    };
    var events = ['change', 'keyup'];
    var emailPattern = /^\S+[@]\S+\.\S{2,10}$/i;
    self.weight = 1;
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
    }

    self.isValid = function (value) {
      if (value === '' || value === undefined || value === false) {
        return true;
      }
      return emailPattern.test(value);
    };
    init(config);
  }

  function Unique(config) {
    var self = this;
    var className = 'unique';
    self.getClassName = function () {
      return className;
    };

    var lastValidValue = false;
    var url;
    var ajax = false;
    var events = ['change', 'keyup', 'blur'];
    self.weight = 5;
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
      if (conf.url !== undefined) {
        url = conf.url;
      }
    }

    self.isValid = function (value) {
      if (ajax !== false) {
        ajax.abort();
      }
      if (lastValidValue !== value) {
        ajax = $.ajax({
          'url': url,
          'data': {'value': value},
          'method': 'POST',
          'async': false
        });
        var result = ajax.responseText;
        if (result === 'true') {
          lastValidValue = value;
        } else {
          lastValidValue = false;
        }
        return result;
      } else {
        return true;
      }
    };
    init(config);
  }

  function Phone(config) {
    var self = this;
    var input;
    var className = 'phone';
    var events = ['blur'];

    self.getClassName = function () {
      return className;
    };
    self.weight = 4;
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
      }
    }

    self.isValid = function () {
      var mask = input.inputmask('option', 'mask');
      return Inputmask.isValid(input.val(), {alias: mask});
    };
    init(config);
  }


  function StringLength(config) {
    var self = this;
    var min, max;
    var className = 'string-length';
    self.getClassName = function () {
      return className;
    };
    var events = ['change', 'keyup', 'blur'];
    self.weight = 3;
    self.setEvents = function (e) {
      events = e;
    };

    self.getEvents = function () {
      return events;
    };

    function init(conf) {
      if (conf.min !== undefined) {
        min = conf.min;
      }
      if (conf.max !== undefined) {
        max = conf.max;
      }
      if (conf.events !== undefined) {
        self.setEvents(conf.events);
      }
    }

    self.isValid = function (string) {
      var strLen = string.length;
      if (min !== undefined) {
        if (strLen < min) {
          className = 'string-length-min';
          return false;
        }
      }
      if (max !== undefined) {
        if (strLen > max) {
          className = 'string-length-max';
          return false;
        }
      }

      return true;

    };
    init(config);
  }

  function PasswordConfirm(config) {
    var self = this;
    var className = 'password-confirm';
    self.getClassName = function () {
      return className;
    };
    var events = ['change', 'keyup', 'blur'];
    self.weight = 4;
    var password;
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
      if (conf.password !== undefined) {
        password = $(conf.password);
      }
    }

    self.isValid = function (value) {
      return password.val() === value;
    };
    init(config);
  }

  function Validator(config) {
    function init(conf) {
      switch (conf.type) {
        case 'required':
        {
          return new Required(conf);
        }
        case 'email':
        {
          return new Email(conf);
        }
        case 'unique':
        {
          return new Unique(conf);
        }
        case 'password-confirm':
        {
          return new PasswordConfirm(conf);
        }
        case 'string-length':
        {
          return new StringLength(conf);
        }
        case 'date':
        {
          return new DateValidator(conf);
        }
        case 'phone':
        {
          return new Phone(conf);
        }
        default :
        {
          throw new Error('Unfinded validator: ' + conf.type);
        }
      }
    }

    return init(config);
  }


  return Validator;
})();


