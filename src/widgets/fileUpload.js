/* global Flow:true,dragula: true*/
var hex = (function (h) {
  'use strict';
  h.widgets.fileupload = function (control, config) {
    var input, url, uploader;
    var dropzone;
    var allowedTypes;
    var single = false;
    var thumbSample;
    var uploaderId;
    var files = [];
    var widget = this;
    widget.loading = false;


    function change() {
      var tmp = [];
      for (var i in files) {
        if (files[i].valid && files[i].id !== undefined) {
          tmp.push(parseInt(files[i].id));
        }
      }
      control.setValue(tmp);
    }

    function checkLoading() {
      var loading = false;
      for (var i in files) {
        if (files[i].loading === true) {
          loading = true;
          break;
        }
      }
      widget.loading = loading;
    }


    var UpFile = function (upfileConf) {
      var self = this;
      self.id = undefined;
      self.uid = undefined;
      self.thumb = undefined;
      self.url = undefined;
      self.name = undefined;
      self.valid = true;
      self.rid = 0;
      self.loading = false;
      var element;

      function generateRid() {
        var rid = uploaderId;
        if (self.id !== undefined) {
          rid += '_' + self.id;
        }
        if (self.uid !== undefined) {
          rid += '_' + self.uid;
        }
        self.rid = rid;
        element.attr('id', rid);
      }

      function appendParams(params) {
        if (params !== undefined) {
          for (var attr in params) {
            if (self.hasOwnProperty(attr)) {
              self[attr] = params[attr];
            }
          }
        }
        if (self.id === undefined) {
          self.valid = false;
        }
      }

      self.setElement = function (el) {
        element = el;
        element.on('click', 'remove', function (event) {
          event.preventDefault();
          self.remove();
          return false;
        });
        generateRid();
      };


      self.progress = function (p) {
        self.valid = false;
        element.find('p').show().css('width', p + '%');
      };


      self.complete = function (message) {
        self.valid = true;
        self.loading = false;
        appendParams(message);
        element.removeClass('loading');
        var preview = element.find('.upload-preview');
        preview.attr('href', self.url);
        preview.show();
        if (self.thumb !== undefined) {
          preview.html('<img src="' + self.thumb + '"/>');
        }
        element.find('p').hide();
        self.loading = false;
        change();
      };

      self.remove = function (fast) {
        self.valid = false;
        self.loading = false;
        var i = files.indexOf(self);
        if (i >= 0) {
          widget.uploaderRemoveFile(self.uid);
          files.splice(i, 1);
        }
        if (fast === true) {
          element.remove();
        } else {
          element.fadeOut(function () {
            element.remove();
          });
        }
        checkLoading();
        change();

      };

      self.error = function (message) {
        self.valid = false;
        self.loading = false;
        element.find('p').hide();
        element.removeClass('loading');
        message = '! Ошибка:<br/>' + message;
        element.find('.frame').html('<div class="upload-error">' + message + '</div>');
        element.addClass('upfile-error');
        element.removeClass('upfile-new');
        var i = files.indexOf(self);
        if (i >= 0) {
          widget.uploaderRemoveFile(self.uid);
          files.splice(i, 1);
        }
      };

      appendParams(upfileConf);
    };

    widget.uploaderRemoveFile = function (uid) {
      var uploaderFiles = uploader.files;
      for (var i in uploaderFiles) {
        if (uploaderFiles[i].uniqueIdentifier === uid) {
          uploader.removeFile(uploaderFiles[i]);
          break;
        }
      }
    };

    function generateThumb(f, className) {
      var newThumb = thumbSample.clone();
      if (className !== undefined) {
        newThumb.addClass(className);
      }
      newThumb.find('i').attr('title', f.name).html(f.name);
      var preview = newThumb.find('.upload-preview');
      if (f.url !== undefined) {
        preview.attr('href', f.url);
        if (f.thumb !== undefined) {
          preview.html('<img src="' + f.thumb + '"/>');
        }
      } else {
        preview.hide();
      }
      return newThumb.get(0).outerHTML;
    }

    function render() {
      var html = '';
      for (var i in files) {
        html += generateThumb(files[i]);
      }
      dropzone.html(html);
      dropzone.find('thumb').each(function (j) {
        files[j].setElement($(this));
      });
    }

    function add(file) {
      if (single) {
        for (var i in files) {
          files[i].remove(true);
        }
        dropzone.find('thumb').remove();
        change();
      }
      var newFile = new UpFile({'uid': file.uniqueIdentifier, 'name': file.name, 'loading': true});
      var html = generateThumb(newFile, 'upfile-new loading');
      dropzone.append(html);
      newFile.setElement(dropzone.find('thumb:last-child'));
      files.push(newFile);
      newFile.progress(5);
      checkLoading();
    }

    function findFileByUid(uid) {
      var l = files.length;
      for (var i = 0; i <= l; i++) {
        if (files[i].uid === uid) {
          return files[i];
        }
      }
      return false;
    }

    function markError(file, message) {
      var errorFile = findFileByUid(file.uniqueIdentifier);
      if (errorFile !== false) {
        errorFile.error(message);
      }
      checkLoading();
    }


    function complete(file, message) {
      var cFile = findFileByUid(file.uniqueIdentifier);
      if (cFile !== false) {
        cFile.complete(message);
      }
      checkLoading();
    }

    function progress(file) {
      var percent = Math.floor(file.size / 100);
      var p = Math.floor(file.sizeUploaded() / percent);
      var pFile = findFileByUid(file.uniqueIdentifier);
      if (pFile !== false) {
        pFile.progress(p);
      }
    }

    function reorder() {
      var sorted = [];
      dropzone.find('thumb').each(function () {
        var rid = $(this).attr('id');
        for (var i in files) {
          if (files[i].rid === rid) {
            sorted.push(files[i]);
          }
        }
      });

      files = sorted;
      change();
    }

    function init() {
      input = control.getInputs()[0];
      uploaderId = 'u_' + input.attr('id') + '_';
      if (config.types !== undefined) {
        allowedTypes = [];
        var reg = /$[\.]/;
        for (var t in config.types) {
          var type = config.types[t];
          if (!reg.test(type)) {
            type = '.' + type;
          }
          allowedTypes.push(type);
        }

      }
      if (config.single === true) {
        single = true;
      }


      if (config.url !== undefined) {
        url = config.url;
      } else {
        throw new Error('doesnt set url paremetr on ' + control.name);
      }


      var flowParams = {
        target: url,
        singleFile: single,
        simultaneousUploads: 5,
        chunkSize: 1 * 512 * 512,
        maxChunkRetries: undefined,
        allowDuplicateUploads: false,
        prioritizeFirstAndLastChunk: true,
        generateUniqueIdentifier: function (file) {
          var ident = 'file_';
          ident += file.size;
          ident += file.name;
          ident += uploaderId;
          ident = h.utils.md5(ident);
          return ident;
        }
      };

      uploader = new Flow(flowParams);
      thumbSample = input.closest('.form-group').find('.upload-dropzone *').first().clone(false);
      input.closest('.form-group').find('.upload-dropzone *').remove();

      dropzone = input.closest('.form-group').find('.upload-dropzone');
      dropzone.on('dragenter', function () {
        $(this).addClass('drag');
      });
      dropzone.on('dragover', function () {
        $(this).addClass('drag');
      });
      dropzone.on('dragend', function () {
        $(this).removeClass('drag');
      });
      dropzone.on('drop', function () {
        $(this).removeClass('drag');
      });
      dropzone.on('mouseout', function () {
        $(this).removeClass('drag');
      });
      dropzone.on('dragleave', function () {
        $(this).removeClass('drag');
      });


      if (!single) {
        var drake = dragula([dropzone[0]], {
          'mirrorContainer': dropzone.closest('.form-group')[0],
          'direction': 'horizontal',
          'copy': false,
          'copySortSource': false
        });
        drake.on('drop', function () {
          reorder();
        });
      }

      var existFiles = input.data('hexFiles');
      if (existFiles !== undefined) {
        for (var i in existFiles) {
          var existFile = new UpFile(existFiles[i]);
          files.push(existFile);
        }
        render();
      }

      change();
      if (uploader.support) {
        var browseParams = {};
        if (allowedTypes !== undefined) {
          browseParams.accept = allowedTypes.join(',');
        }

        uploader.assignBrowse(input.closest('.form-group').find('[data-upload]')[0], false, single, browseParams);
        uploader.assignDrop(dropzone[0]);
        uploader.on('fileAdded', function (file) {
          var valid = true;
          if (allowedTypes !== undefined) {
            if (allowedTypes.indexOf('.' + file.getType()) < 0) {
              valid = false;
            }
          }
          if (valid) {
            add(file);
          } else {
            add(file);
            markError(file, '"' + file.name + '" - неверный тип файла. Разрешены файлы типа: ' + allowedTypes.join(', '));
          }
          return valid;
        });
        uploader.on('fileSuccess', function (file, message) {
          message = $.parseJSON(message);
          complete(file, message);
        });
        uploader.on('fileError', function (file, message) {
          markError(file, message);
        });
        uploader.on('filesSubmitted', function () {
          uploader.upload();
        });
        uploader.on('fileProgress', function (file) {
          progress(file);
        });
      }

    }

    init();
  };

  return h;
}(hex));
