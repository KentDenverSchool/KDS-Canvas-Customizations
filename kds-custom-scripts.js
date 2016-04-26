//Users are aclement, aimhoff, bsimmons, scohen, aoro, hlindsay, mlewis, tham, ahoff, jhuh, ...
//cmarsh, wmattingly, emaxey, pramurthy, srubin, asaffold, rschaffer, ssveen, pwang, ewaters, jzhou
//
var betaUsers = [834, 12, 705, 572, 234, 227, 383, 639, 641, 644, 657, 658, 659, 664, 667, 979, 669, 674, 678, 679, 683];

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

var speedGraderHTML = '' + '<button id="other-score-update-button" type="submit"' +
'class="btn btn-primary btn-small"' +
' style="width:150px" ' +
'>Update Scores (Q)</button>' +
'&nbsp<button id="update-and-next-button" type="submit"' +
'class="btn btn-primary btn-small"' +
' style="width:150px" ' +
'>Update and Next (W)</button>' +
'&nbsp<button id="fill-remaining-scores-button" type="submit"' +
'class="btn btn-primary btn-small"' +
' style="width:150px" ' +
'>Fill Remaining (E)</button>';

//disable high contrast styles option on user preferences
onPage(/\/profile/, function() {
        onElementRendered('#ff_toggle_high_contrast', function(el) {
                el.attr('disabled', 'disabled');
        });
});

/*
 ************ Beta Section *****************
 */
isBetaUser(function(b) {

        if(b) {
                /*
                 * disables the to-do list for students, showing only "Coming Up"
                 */
                isStudent(function(b) {
                        if(b) {
                                onElementRendered('#right-side > ul.to-do-list', function(el) {
                                       var dashboardTodo = el; 
                                if(dashboardTodo.length > 0) {
                                        $('#right-side > h2').hide();
                                        dashboardTodo.hide();
                                        console.log("Hiding dash todo");
                                }
                                });
                                var courseTodo = $('#course_show_secondary > ul.to-do-list');
                                if(courseTodo.length > 0) {
                                        $('#course_show_secondary > h2').hide();
                                        courseTodo.hide();
                                        console.log("Hiding course todo");
                                }
                        }    
                });
        }


});
/*******************************************

/*
 * function to modify the apperance of speedgrader
 *  - Adds Update Score button to the right side
 */
isUser(834, function(b) {
        if (b) {
                onPage(/\/courses\/\d+\/gradebook\/speed_grader/, function() {
                        // if assignment is a quiz
                        oniFrameRendered('#speedgrader_iframe', function(sgFrame) {
                                var frameContents = sgFrame.contents();

                                function addShortcuts(event) {
                                        if (event.which == 81) {
                                                event.stopPropagation();
                                                updateAction();
                                        }
                                        if (event.which == 87) {
                                                event.stopPropagation();
                                                updateAndNextAction();
                                        }
                                        if (event.which == 69) {
                                                event.stopPropagation();
                                                fillAction();
                                        }
                                }

                                function updateAction() {
                                        frameContents.find('#speed_update_scores_container > div.update_scores > div > button').click();
                                }

                                function updateAndNextAction() {
                                        var next = $('#gradebook_header > form > div.left > a.next');
                                        var submit = $('#speedgrader_iframe').contents().find('#speed_update_scores_container > div.update_scores > div > button');
                                        submit.click();
                                        setTimeout(function() {
                                                next.click();
                                        }, 500);
                                }

                                function fillAction() {
                                        var boxes = $('#speedgrader_iframe').contents().find('#questions span.question_points_holder > div.user_points:visible');
                                        boxes.each(function() {
                                                var input = $(this).find('input');
                                                var val = input.val();
                                                var points = $(this).find('span').text().split("/ ")[1];
                                                if (val == "") {
                                                        input.val(points);
                                                }
                                        });
                                }
                                $(document).unbind('keyup').keyup(function(event) {
                                        addShortcuts(event)
                                });
                                frameContents.unbind('keyup').keyup(function(event) {
                                        addShortcuts(event)
                                });
                                if (frameContents.find('#speed_update_scores_container').length != 0 && $('#other-score-update-button').length == 0) {
                                        var scoreBox = $('#grade_container');
                                        scoreBox.append(speedGraderHTML);
                                        $('#other-score-update-button').click(function() {
                                                updateAction();
                                        });
                                        $('#fill-remaining-scores-button').click(function() {
                                                fillAction();
                                        });
                                        $('#update-and-next-button').click(function() {
                                                updateAndNextAction();
                                        });
                                }
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
                if (courseTitle != sectionName && enrollment != "teacher") {
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
                        if (courseTitle != sectionName && enrollment != "teacher") {
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
                                                                if (hour && min && period) {
                                                                        var data = {
                                                                                due_hour: hour,
                                                                                due_min: min,
                                                                                due_period: period
                                                                        };
                                                                        userData.data[courseId] = data;
                                                                        $.put('/api/v1/users/' + userId + '/custom_data', userData.data);
                                                                        $('#due_tweak_error').css('color', 'green').html('Success!').show();
                                                                } else {
                                                                        $('#due_tweak_error').css('color', 'red').html('Please enter a time.').show();
                                                                }
                                                        });
                                                        if (userData != undefined) {
                                                                var courseData = userData.data[courseId];
                                                        } else {
                                                                userData = {
                                                                        data: {}
                                                                }
                                                        }
                                                        var hourLoc = $('#due_hour');
                                                        var minLoc = $('#due_minute');
                                                        var periodLoc = $('#due_period');
                                                        var hour;
                                                        var min;
                                                        var period;
                                                        if (courseData != undefined) {
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
   Adds link to view crocodoc feedback in full tab
   */
onPage(/courses\/\d+\/assignments\/\d+\/submissions\/\d+/, function() {
        $('#preview_frame').load(function() {
                var iframe = $('#preview_frame');
                if (iframe != undefined) {
                        var container = iframe.contents().find('#content > div > div > div.col-xs-5.align-right');
                        var dest = $(container.children()[0]).attr('data-crocodoc_session_url');
                        var contHTML = container.html();
                        container.html('<p>' + contHTML + '&nbsp;&nbsp;<a href="' + dest + '" target="_blank">View in New Tab</a></p>')
                }
        });
});
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
 * Check if iFrame is rendered
 */

function oniFrameRendered(selector, cb, _attempts) {
        var targetFrame = $(selector);
        _attempts = ++_attempts || 1;
        if (targetFrame.contents()[0] != undefined && targetFrame.contents()[0].readyState == "complete") {
                targetFrame.on('load', function(e) {
                        return cb(targetFrame);
                });
        }
        if (_attempts == 60) return;
        setTimeout(function() {
                oniFrameRendered(selector, cb, _attempts);
        }, 250);
}
/*
 * Function to only run code for certian users
 */

function isUser(id, cb) {
        cb(ENV.current_user_id == id);
}

function isStudent(cb) {
        cb(ENV.current_user_roles.indexOf('teacher') < 0);
}

function isBetaUser(cb) {
        userId = ENV.current_user_id;
        var betaUser = false;
        for(var i in betaUsers) {
                if(betaUsers[i] == userId) {
                        betaUser = true;
                        break;
                }
        }
        cb(betaUser);
}
/*
   Makes an HTTP PUT request designed for custom_data
   */
                                        $.put = function(url, data) {
                                                return $.ajax({
                                                        url: url,
                                                        type: "PUT",
                                                        dataType: 'json',
                                                        data: {
                                                                ns: 'org.kentdenver.canvas',
                                                                data
                                                        }
                                                });
                                        };
