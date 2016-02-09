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
  $('#user_ajax').trigger('disable');


});
