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
          for (var j = 0, jl = directives[i].variables.length; j < jl; j++) {
            if (linkedVars.indexOf(directives[i].variables[j]) === -1) {
              linkedVars.push(directives[i].variables[j]);
            }
          }
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
          for (var j = 0, jl = d.variables.length; j < jl; j++) {
            if (linkedVars.indexOf(d.variables[j]) === -1) {
              linkedVars.push(d.variables[j]);
            }
          }
        }
      }

      function removeDirective(d) {
        if (directives.indexOf(d) >= 0) {
          directives.splice(directives.indexOf(d), 1);
          clear();
        }
      }

      function draw(renderDirectives) {
        var changedVars = [];
        var localData = JSON.parse(JSON.stringify(data));
        if (linkedVars.length === 0) {
          linkedVars = getLinkedVariables();
        }


        for (var i = 0, length = linkedVars.length; i < length; i++) {
          var paramAsString = linkedVars[i];

          var value;
          if (/\[\'\$root\'\]/.test(paramAsString)) {

            var rootParam = paramAsString.replace(/^(.*)\[\'\$root\'\]/, '');
            var nameSpace = paramAsString.replace(/\[\'\$root\'\](.*)$/, '');



            if (/\$parentIndex/.test(rootParam)) {
              var $parentIndexStringName = nameSpace + '[\'$parentIndex\']';
              var $parentIndexValue = h.utils.objectProperty(localData, $parentIndexStringName);
              rootParam = rootParam.replace(/\$parentIndex/, $parentIndexValue);

              h.utils.objectProperty(localData, $parentIndexStringName, $parentIndexValue);

              if (JSON.stringify($parentIndexValue) !== dataLastVersion[$parentIndexStringName]) {
                changedVars.push($parentIndexStringName);
              }
            }

            value = h.utils.objectProperty(localData, rootParam);
          } else {
            value = h.utils.objectProperty(localData, paramAsString);
          }

          if (value === undefined) {
            value = '';
          }


          h.utils.objectProperty(localData, paramAsString, value);

          if (JSON.stringify(value) !== dataLastVersion[paramAsString]) {
            changedVars.push(paramAsString);
          }
        }
        if (changedVars !== undefined && changedVars.length > 0) {
          var activeDirectives = renderDirectives;
          if (renderDirectives === undefined) {
            activeDirectives = [];
            for (var j = 0, dLength = directives.length; j < dLength; j++) {
              var bind = directives[j];
              for (i = 0, length = changedVars.length; i < length; i++) {
                if (bind.variables.indexOf(changedVars[i]) >= 0) {
                  activeDirectives.push(bind);
                }
              }
            }
          }


          for (i = 0; i < activeDirectives.length; i++) {
            activeDirectives[i].render(localData);
          }

          //Сохраняем последние изменения данных
          for (i = 0, length = changedVars.length; i < length; i++) {
            if (/\[\'\$root\'\]/.test(changedVars[i])) {
              var rootParamName = changedVars[i].replace(/^(.*)\[\'\$root\'\]/, '');
              dataLastVersion[changedVars[i]] = JSON.stringify(h.utils.objectProperty(data, rootParamName));
            } else {
              dataLastVersion[changedVars[i]] = JSON.stringify(h.utils.objectProperty(data, changedVars[i]));
            }
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
  }(hex)
);

