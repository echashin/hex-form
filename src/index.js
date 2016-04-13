/* global moment:true,hexForm:true*/
'use strict';
$(document).ready(function () {
  moment.locale('ru');
  hexForm();
  hexForm('test').on('afterSubmit', function (event, data) {
    console.log(event, data);
  });
});
