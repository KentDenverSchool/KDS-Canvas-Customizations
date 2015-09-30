var tweakHtml = '' +
    '<h2 style="margin-top: 10px;">Kent Tweaks</h2>' +
    '<br>' +
    '<form>' +
      '<h3>Due Date Defaults</h3>' +
      '<label class="ic-Label">Hour</label>' +
      '<input id="due_hour" name="hour" style="width:50px" type="text" aria-required="true">' +
      ':<input id="due_minute" name="minute" style="width:50px" type="text" aria-required="true">' +
      '<select id="due_period" style="width:75px">' +
      '<option>am</option><option>pm</option></select>' +
      '</form>' +
      '<button id="tweaks_due_button"class="btn btn-primary">Update Preferences</button>' +
     '<span id="due_tweak_error" style="color:red; display:none">   Please enter a time.</span>' 

/*
function to display section number next to course title on all course pages
*/
onPage(/\/courses\/\d+/, function() {
    var id = location.pathname.match(/\d+/)[0];
    $.getJSON("/api/v1/courses/" + id + "?include[]=sections", function(data) {
      var sectionName = data.sections[0].name;
      var courseCrumb = $("#breadcrumbs ul li:eq(1) a span");
      var courseTitle = courseCrumb.html();
      if(courseTitle != sectionName) {
          courseCrumb.html(courseCrumb.html() + " (" + sectionName + ")");
      }
    });
});
/*
function to display section number on dashboard
*/
onPage(/\/$/, function() {
    var dashboardCards = $('#DashboardCard_Container').find('.card');
    dashboardCards.each(function() {
        var curCard = $(this).find('.ic-DashboardCard__link');
        var courseId = curCard.attr('href').split('/')[2];
        $.getJSON("/api/v1/courses/" + courseId + "?include[]=sections", function(data) {
                var sectionName = data.sections[0].name;
                var subtitle = curCard.find('.ic-DashboardCard__header-subtitle');
                subtitle.html(sectionName);
        });
    });
});

onPage(/\/courses\/\d+\/settings$/, function() {
    var courseId = location.pathname.match(/\d+/)[0];
    var userId = ENV.current_user_id;
    var userData;
    $.getJSON('/api/v1/users/' + userId + '/custom_data?ns=org.kentdenver.canvas', function(data) {
        userData = data;
    }).complete(function() {
        var tabs = $('#course_details_tabs');
        tabs.tabs('add', '#tab-tweaks', 'Kent Tweaks');
        $('#tab-tweaks').html(tweakHtml);
        $('#tweaks_due_button').click(function() {
            hour = hourLoc.val();
            min = minLoc.val();
            period = periodLoc.val();
            if(hour && min && period) {
                var data = {due_hour: hour, due_min: min, due_period: period};
                userData.data[courseId] = data;
                $.put('/api/v1/users/' + userId + '/custom_data', userData.data);
                $('#due_tweak_error').hide(); 
            } else {
                $('#due_tweak_error').show();
            }
        });
        if(userData != undefined) {
            var courseData = userData.data[courseId];
        }
        var hourLoc = $('#due_hour');
        var minLoc = $('#due_minute');
        var periodLoc = $('#due_period');
        var hour;
        var min;
        var period;
        if(courseData != undefined) {
            hour = courseData.due_hour;
            min = courseData.due_min;
            period = courseData.due_period;
            hourLoc.val(hour);
            minLoc.val(min);
            periodLoc.val(period);
        }
    });
});

onElementRendered('#bordered-wrapper > div > div:nth-child(2) > div:nth-child(1) > div > div > div.input-append > button', function(el) {
    var courseId = location.pathname.match(/\d+/)[0];
    var userId = ENV.current_user_id;
    var userData;
    $.getJSON('/api/v1/users/' + userId + '/custom_data?ns=org.kentdenver.canvas', function(data) {
        userData = data;
        var courseData = userData.data[courseId];
        console.log(courseData);
        el.click(function() {
            $('#ui-datepicker-time-hour').val(courseData.due_hour);
            $('#ui-datepicker-div > div.ui-datepicker-time.ui-corner-bottom > input.ui-datepicker-time-minute').val(courseData.due_min);
           $('#ui-datepicker-div > div.ui-datepicker-time.ui-corner-bottom > select').val(courseData.due_period); 
        });
    }); 
});

function onPage(regex, fn) {
  if (location.pathname.match(regex)) fn();
}

function onElementRendered(selector, cb, _attempts) {
        var el = $(selector);
        _attempts = ++_attempts || 1;
        if (el.length) return cb(el);
        if (_attempts == 60) return;
        setTimeout(function() {
                onElementRendered(selector, cb, _attempts);
        }, 250);
}

$.put = function(url, data) {
         return $.ajax({
                url: url,
                type: "PUT",
                dataType: 'json',
                data: {ns: 'org.kentdenver.canvas', data}
         });
};

