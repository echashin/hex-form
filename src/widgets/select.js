var hex = (function (h) {
    'use strict';

    h.widgets.select = function (control, config) {
        var input;
        var options = [];
        var select_cont;
        var open = false;
        var name;

        function render() {
            select_cont.find('ul').remove();
            var text = '<ul class="dropdown-menu">';
            for (var i in options) {
                if (options[i].selected) {
                    text += '<li class="checkbox checked" data-value="' + options[i].value + '">' + options[i].text + '</li>'
                } else {
                    text += '<li class="checkbox" data-value="' + options[i].value + '">' + options[i].text + '</li>'
                }
            }

            text += '</ul>';
            select_cont.append(text);
        }

        function init() {
            input = control.getInputs()[0];
            name = input.attr('name');
            select_cont = input.closest('label');
            select_cont.addClass('select');
            select_cont.append('<div class="form-control"></div>');

            select_cont.find('.form-control').on('click', function () {
                if (!open) {
                    select_cont.find('ul').addClass('open');
                    open = true;
                } else {
                    select_cont.find('ul').removeClass('open');
                    open = false;
                }
            });
            select_cont.on('click','li',function(){
                input.val($(this).data('value'));
            });


            var html_options = input.find('option');
            html_options.each(function () {
                var opt = $(this);
                var selected = false;
                if (opt.is(':selected')) {
                    selected = true;
                }
                options.push({value: opt.attr('value'), text: opt.text(), selected: selected});
            });

            render();
        }

        init();

        //return {getAssoc: getAssoc, setAssoc: setAssoc}
    };

    return h;
}(hex));
