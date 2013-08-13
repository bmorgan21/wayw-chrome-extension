var format_date = function(date_str) {
    return moment(date_str + ' 00:00').format('dddd, MMMM DD, YYYY');
}

var update_date = function(date_str, $di, $dt) {
    $di.attr('value', date_str);
    $dt.html(format_date(date_str));
}

var check_email = function($email, init) {
    var $help_block = $email.next('.help-block');

    if ($.trim($email.val()) == '') {
        $help_block.html('please provide an email address');
        $email.closest('div').addClass('has-error');
        if (!init) {
            $email.closest('div').removeClass('init');
        }
        return false;
    }

    return true;
}

var check_location = function($well, $location) {
    var $help_block = $well.find('.help-block');

    if (!$location.val()) {
        $well.addClass('has-error');
        $help_block.html('please select a location');
        return false;
    }

    return true;
}

var day_of_week = function(date_str) {
    return moment(date_str + ' 00:00').format('dddd')
}

$(document).ready(function(){
    var $dp = $('#dp');
    var $dt = $dp.find('.text');
    var $di = $dp.next('input[name="d"]');

    $dp.data('date', moment().format('YYYY-MM-DD'));
    $dp.datepicker()
		.on('changeDate', function(ev){
			$dp.datepicker('hide');
            update_date($dp.data('date'), $di, $dt);
		});
    update_date($dp.data('date'), $di, $dt);

    var $form = $('#f');
    var $email = $form.find('input[name="e"]');
    var $date = $form.find('input[name="d"]');
    var $well = $form.find('.well');
    var $locations = $form.find('input[name="l"]');

    $form.find('input[name="l"][value="' + localStorage['location-' + day_of_week($dp.data('date'))] + '"]').prop('checked', true);

    $email.val(localStorage.email);
    check_email($email, true);

    $form.on('submit', function(evt) {
        var $location = $form.find('input[name="l"]:checked');

        if (!check_email($email, false)) return false;
        if (!check_location($well, $location)) return false;

        var email = $email.val();
        var date = $date.val();
        var location = $location.val();

        localStorage.email = email;
        localStorage['date-' + date] = true;
        localStorage['location-' + day_of_week($date.val())] = location;

        $.post('http://photatom.com/wyaw/?e=' + encodeURIComponent(email), {a:'update', d:date, l:location}, function(data) {
            var $panel_footer = $('.panel-footer');

            if (data.indexOf('OK') == 0) {
                $('#myModal .modal-footer').hide();
                $('#myModal .modal-title').html('Confirm');
                $('#myModal .modal-body').html('Updated Successfully! [' + location + ' on ' + date + ']');
                $('#myModal').modal('show');
                chrome.runtime.getBackgroundPage(function(bp) {
                    bp.check_status();
                });
                setTimeout(window.close, 2*1000);
            } else {
                $('#myModal .modal-footer').show();
                $('#myModal .modal-title').html('Error');
                $('#myModal .modal-body').html(data);
                $('#myModal').modal('show');
            }
        });

        return false;
    });

    $email.on('focus', function(evt) {
        $email.closest('div').removeClass('has-error');
    });

    $locations.on('change', function(evt) {
        $locations.closest('div').removeClass('has-error');
    });

    var $btn_later = $('button.later');
    $btn_later.on('click', function(evt) {
        var bp = chrome.extension.getBackgroundPage();
        bp.delay_seconds(30*60); // 30 minutes
        window.close();
        return false;
    });
});
