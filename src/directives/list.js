var hex = (function (h) {
  'use strict';
  h.directives.List = function (config) {


    var
      node,//DOM node
      template,//Шаблон
      namespace,
      block,
      handlers = {}//привязанные к контролу события
      ;

    function getNamespace() {
      return namespace;
    }

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


    function add(item) {


      var newItem = template.clone(false);
      newItem.attr('data-hex-block', '');
      if (node.children('[data-hex-block]').size() > 0) {
        newItem.insertAfter(node.children('[data-hex-block]').last());
      } else {
        node.prepend(newItem);
      }

      var newBlock = block.addBlock(newItem);

      newBlock.getData().$index = node.children('[data-hex-block]').size() - 1;

      if (newBlock.parent !== false) {
        newBlock.getData().$parentIndex = newBlock.parent.getData().$index;
      }

      if (!$.isEmptyObject(item)) {
        newBlock.setData(item);
      }

      newBlock.render();
      trigger('add', newItem);
      return newBlock;
    }

    function remove(index) {
      var ind = index + 1;
      var removed = node.children('[data-hex-block]:nth-child(' + ind + ')').first();
      if (removed.size() > 0) {
        removed.get(0).getBlock().remove();
      }


      node.children('[data-hex-block]').each(function (indx) {
        var nBlock = $(this).get(0).getBlock();
        var data = nBlock.getData();
        data.$index = indx;
        if (nBlock.childBlocks.length > 0) {
          for (var i = 0, len = nBlock.childBlocks.length; i < len; i++) {
            nBlock.childBlocks[i].getData().$parentIndex = indx;
          }
        }

        $(this).get(0).getBlock().render();
      });
      trigger('remove', index);
    }

    function render() {

    }


    var directive = {
      variables: [],
      getNamespace: getNamespace,
      render: render,
      on: on,
      off: off,
      trigger: trigger,
      add: add,
      remove: remove
    };

    function init(conf) {
      node = $(conf.node);
      block = conf.block;
      namespace = node.attr('data-hex-list');
      if (conf.data[namespace] === undefined) {
        h.utils.objectProperty(conf.data, namespace, []);
      }

      template = node.children('[data-hex-list-tpl]').first().clone(false).removeAttr('data-hex-list-tpl');
      node.children('[data-hex-list-tpl]').first().remove();

      if (template.find('a[data-toggle="tab"]').size() > 0) {
        on('add', function (newNode) {
          window.setTimeout(function () {
            newNode.find('a[data-toggle="tab"]').click();
          }, 1);
        });
        on('remove', function (index) {
          var ind = index + 1;
          window.setTimeout(function () {
            var next = node.find('[data-hex-block]:nth-child(' + ind + ')').first();
            if (next.size() > 0) {
              next.find('a[data-toggle="tab"]').click();
            } else {
              ind--;
              var prev = node.find('[data-hex-block]:nth-child(' + ind + ')').first();
              if (prev.size() > 0) {
                prev.find('a[data-toggle="tab"]').click();
              }
            }
          }, 1);
        });
      }

      directive.variables.push(namespace);
    }

    init(config);
    return directive;
  };

  return h;
}(hex));
