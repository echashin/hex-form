var hex = (function (h) {
  'use strict';
  h.directives.ListAdd = function (config) {


    var
      node//DOM node
      , namespace
      , handlers = {}//привязанные к контролу события
      , item = {}
      ;

    function on(eventName, fn) {
      if (handlers[eventName] === undefined) {
        handlers[eventName] = [];
      }
      if (handlers[eventName].indexOf(fn) < 0) {
        handlers[eventName].push(fn);
      }
    }

    function off(eventName, fn) {
      if (handlers[eventName] !== undefined) {
        handlers[eventName].splice(handlers[eventName].indexOf(fn), 1);
      }
    }

    function trigger(eventName, params) {
      if (handlers[eventName] !== undefined) {
        for (var fnIndex in handlers[eventName]) {
          var func = handlers[eventName][fnIndex];
          func(params);
        }
      } else {
        return true;
      }
    }

    var directive = {
      on: on,
      off: off,
      trigger: trigger
    };

    function init(conf) {
      node = $(conf.node);
      var params = node.attr('data-hex-list-add').split('|');
      namespace = params[0];
      if (!h.utils.isEmpty(params[1])) {
        item = JSON.parse(params[1]);
      }

      node.on('click', function (event) {
        event.preventDefault();
        trigger('add', {namespace: namespace, item: item});
      });
    }


    init(config);
    return directive;
  };

  return h;
}(hex));
