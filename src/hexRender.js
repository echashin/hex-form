var hex = (function (h) {
  'use strict';
  h.Render = function () {
    var directives = [];


    var data = {};
    var dataLastVersion = {};
    var linkedVars = [];

    function getLinkedVariables() {
      linkedVars = [];
      for (var i = 0, length = directives.length; i < length; i++) {
        linkedVars = linkedVars.concat(directives[i].variables);
      }
      linkedVars = h.utils.arrayUniq(linkedVars);
      return linkedVars;
    }

    function clear() {
      linkedVars = [];
      dataLastVersion = {};
    }

    function addDirective(d) {
      if (directives.indexOf(d) === -1) {
        directives.push(d);
        linkedVars = linkedVars.concat(d.variables);
      }
    }

    function removeDirective(d) {
      if (directives.indexOf(d) >= 0) {
        /*
        d.variables.forEach(function (v) {
          if (dataLastVersion[v] !== undefined) {
            delete dataLastVersion[v];
          }
          if (linkedVars !== undefined) {
            if (linkedVars.indexOf(v) !== -1) {
              linkedVars.splice(linkedVars.indexOf(v), 1);
            }
          }
        });
        */
        directives.splice(directives.indexOf(d), 1);
        clear();
      }
    }

    function draw() {
      var changedVars = [];
      var localData = JSON.parse(JSON.stringify(data));

      if (linkedVars.length === 0) {
        linkedVars = getLinkedVariables();
      }
      for (var i = 0, length = linkedVars.length; i < length; i++) {
        var paramAsString = linkedVars[i];
        var value = h.utils.objectProperty(data, paramAsString);

        if (value === undefined) {
          value = '';
        }

        h.utils.objectProperty(localData, paramAsString, value);

        if (JSON.stringify(value) !== dataLastVersion[paramAsString]) {
          changedVars.push(paramAsString);
        }
      }


      if (changedVars !== undefined && changedVars.length > 0) {
        var activeDirectives = directives.filter(function (bind) {
          for (i = 0, length = changedVars.length; i < length; i++) {
            if (bind.variables.indexOf(changedVars[i]) >= 0) {
              return true;
            }
          }
          return false;
        });

        for (i = 0; i < activeDirectives.length; i++) {
          activeDirectives[i].render(localData);
        }
        //Сохраняем последние изменения данных
        for (i = 0, length = changedVars.length; i < length; i++) {
          dataLastVersion[changedVars[i]] = JSON.stringify(h.utils.objectProperty(data, changedVars[i]));
        }
      }
    }

    var render = {
      directives: directives,
      removeDirective: removeDirective,
      addDirective: addDirective,
      data: data,
      draw: draw,
      clear: clear
    };

    return render;
  };
  return h;
}(hex));

