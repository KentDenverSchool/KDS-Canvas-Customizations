var tweakHtml = '' +
    '<h2 style="margin-top: 10px;">KDS Features</h2>' +
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
     '<span id="due_tweak_error" style="padding-left:10px; color:red; display:none">Please enter a time.</span>';

var speedGraderHTML = '' + '<button id="other-score-update-button" type="submit"'+ 
                    'class="btn btn-primary update-scores"' +
                    ' style="width:150px" ' +
                    '>Update Scores</button>';
/*
 * function to modify the apperance of speedgrader
 *  - Adds Update Score button to the right side
*/
isUser(834, function(b) {
    if(b) {
        onPage(/\/courses\/\d+\/gradebook\/speed_grader/, function() {
            var scoreBox = $('#grade_container');
            scoreBox.append(speedGraderHTML);
            $('#other-score-update-button').click(function() {
                var sgFrame = $('#speedgrader_iframe');
                var frameContents = sgFrame.contents();
                var oldButton = frameContents.find('#speed_update_scores_container > div.update_scores > div > button').click();
            });
        });
    }
});
/*
function to display section number next to course title on all course pages
*/
onPage(/\/courses\/\d+/, function() {
    var id = location.pathname.match(/\d+/)[0];
    $.getJSON("/api/v1/courses/" + id + "?include[]=sections", function(data) {
      var sectionName = data.sections[0].name;
      var courseCrumb = $("#breadcrumbs ul li:eq(1) a span");
      var courseTitle = courseCrumb.html();
      var enrollment = data.enrollments[0].type;
      if(courseTitle != sectionName && enrollment != "teacher") {
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
                var courseTitle = curCard.find('.ic-DashboardCard__header-title').html();
                var enrollment = data.enrollments[0].type;
                if(courseTitle != sectionName && enrollment != "teacher") {
                    subtitle.html(sectionName);
                }
        });
    });
});

/*
Creates KDS Features Tab under course settings which adds a settings panel to control the following features:
- Due date defaults
*/
onPage(/\/courses\/\d+\/settings$/, function() {
    var courseId = location.pathname.match(/\d+/)[0];
    var userId = ENV.current_user_id;
    var userData;
    $.getJSON('/api/v1/users/' + userId + '/custom_data?ns=org.kentdenver.canvas', function(data) {
        userData = data;
    }).complete(function() {
        var tabs = $('#course_details_tabs');
        tabs.tabs('add', '#tab-tweaks', 'KDS Features');
        $('#tab-tweaks').html(tweakHtml);
        $('#tweaks_due_button').click(function() {
            hour = hourLoc.val();
            min = minLoc.val();
            period = periodLoc.val();
            if(hour && min && period) {
                var data = {due_hour: hour, due_min: min, due_period: period};
                userData.data[courseId] = data;
                $.put('/api/v1/users/' + userId + '/custom_data', userData.data);
                $('#due_tweak_error').css('color', 'green').html('Success!').show(); 
            } else {
                $('#due_tweak_error').css('color', 'red').html('Please enter a time.').show(); 
            }
        });
        if(userData != undefined) {
            var courseData = userData.data[courseId];
        } else {
            userData = {data:{}}
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
/*
Due date default implementation, pre fills due date time field with user's custom values
*/
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

/*
Limits functions to only run on pages that match the provided regex
*/
function onPage(regex, fn) {
  if (location.pathname.match(regex)) fn();
}

/*
Waits for 30 seconds to see if an element is rendered
*/
function onElementRendered(selector, cb, _attempts) {
        var el = $(selector);
        _attempts = ++_attempts || 1;
        if (el.length) return cb(el);
        if (_attempts == 60) return;
        setTimeout(function() {
                onElementRendered(selector, cb, _attempts);
        }, 250);
}
/*
 * Function to only run code for certian users
*/
function isUser(id, cb) {
          cb(ENV.current_user_id == id);
}
/*
 Makes an HTTP PUT request designed for custom_data
 */
$.put = function(url, data) {
         return $.ajax({
                url: url,
                type: "PUT",
                dataType: 'json',
                data: {ns: 'org.kentdenver.canvas', data}
         });
};

