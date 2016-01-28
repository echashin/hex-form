/* global moment:true,hexForm:true*/
'use strict';
$(document).ready(function () {
  moment.locale('ru');
  hexForm();



  /*
   var form = hexForm('test');
  form.on('beforeSubmit', function (data, event) {
    event.stop();
    console.log(data);
  });
  */


  $('#fileupload').fileupload({
    url: '/test/server/php/',
    dataType: 'json',
    done: function (e, data) {
      $.each(data.result.files, function (index, file) {
        $('<p/>').text(file.name).appendTo('#files');
      });
    },
    progressall: function (e, data) {
      var progress = parseInt(data.loaded / data.total * 100, 10);
      $('#progress .progress-bar').css(
        'width',
        progress + '%'
      );
    }
  }).prop('disabled', !$.support.fileInput)
    .parent().addClass($.support.fileInput ? undefined : 'disabled');

});
