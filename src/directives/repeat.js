var hex = (function (h) {
  'use strict';
  h.directives.Repeat = function (config) {

    var
      node,//DOM node
      namespace,
      template,
      comment,
      nodes = [],
      block;

    function render() {
      var data = block.getData()[namespace];
      nodes.forEach(function (n) {
        n.remove();
      });
      if (data !== undefined) {
        for (var i in data) {
          node = template.clone(false);
          node.insertAfter(comment);
          nodes.push(node);
        }
      }
    }


    var directive = {
      variables: [],
      render: render
    };

    function init() {
      node = $(config.node);
      block = config.block;
      namespace = node.attr('data-hex-repeat');
      template = node.clone(false);
      directive.variables.push('[\'' + namespace + '\']');
      comment = $(document.createComment('hex-repeat (' + namespace + ')'));
      comment.insertBefore(node.get(0));
      node.remove();
    }

    init();
    return directive;
  };

  return h;
}(hex));
