/* global moment:true*/
var hex = (function (h) {
  'use strict';
  h.widgets.search = function (control, config) {
    var input;
    var elements = [];

    function search(q, items) {
      var i = items.length - 1;
      for (i; i >= 0; i--) {
        if (items[i].text.indexOf(q) > -1) {
          items[i].node.removeClass('hidden');
        } else {
          items[i].node.addClass('hidden');
        }
      }
    }

    function showAll(items) {
      var i = items.length - 1;
      for (i; i >= 0; i--) {
        items[i].node.removeClass('hidden');
      }
    }

    function init() {
      input = control.getInputs()[0];
      var nodes = $(config.selector);
      if (nodes.size() > 0) {
        nodes.each(function () {
          elements.push({
            text: $(this).text().toLowerCase(),
            node: $(this)
          });
        });
      }

      input.on('change keyup mouseup', function () {
        var q = input.val().toLowerCase();

        if (h.utils.isEmpty(q)) {
          showAll(elements);
        } else {
          search(q, elements);
        }
      });

    }


    init();
  };

  return h;
}(hex));
