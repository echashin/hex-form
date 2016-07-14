var hex = (function (h) {
  'use strict';
  h.directives.ListRemove = function (config) {


    var
      node//DOM node
      , handlers = {}//привязанные к контролу события
      , namespace
      , variables = []
      , allowEmpty = false
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

    function render(data) {
      if (!allowEmpty) {
        var length = data[namespace].length;
        if (length < 2) {
          node.prop('disabled', true);
        } else {
          node.prop('disabled', false);
        }
      }
    }

    var directive = {
      render: render,
      on: on,
      off: off,
      trigger: trigger
    };

    Object.defineProperty(directive, 'variables', {
      enumerable: true,
      configurable: true,
      get: function () {
        return variables.map(function (d) {
          return config.block.parent.namespaceFull + d;
        });
      },
      set: function () {

      }
    });

    function init(conf) {
      node = $(conf.node);
      namespace = node.closest('[data-hex-list]').attr('data-hex-list');
      if (node.closest('[data-hex-list]').attr('data-hex-list-allowempty') !== undefined) {
        allowEmpty = true;
      }

      variables.push('[\'' + namespace + '\']');

      node.on('click', function (event) {
        event.preventDefault();
        var data = $(this).closest('[data-hex-block]').get(0).getBlock().getData();
        trigger('remove', {
          namespace: namespace,
          data: data
        });
      });
    }


    init(config);
    return directive;
  };

  return h;
}(hex));
