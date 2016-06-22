var hex = (function (h) {
  'use strict';
  h.directives.ListRemove = function (config) {


    var
      node//DOM node
      , handlers = {}//привязанные к контролу события
      , namespace
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
      namespace = node.closest('[data-hex-list]').attr('data-hex-list');

      node.on('click', function (event) {
        event.preventDefault();
        var index = $(this).closest('[data-hex-block]').get(0).getBlock().getData().$index;
        trigger('remove', {namespace: namespace, index: index});
      });
    }


    init(config);
    return directive;
  };

  return h;
}(hex));
