//Users are aclement, aimhoff, bsimmons, scohen, aoro, hlindsay, mlewis, tham, ahoff, jhuh, ...
//cmarsh, wmattingly, emaxey, pramurthy, srubin, asaffold, rschaffer, ssveen, pwang, ewaters, jzhou
//
var betaUsers = [834, 12, 705, 572, 234, 227, 383, 639, 641, 644, 657, 658, 659, 664, 667, 979, 669, 674, 678, 679, 683];

var tweakHtml = '' +
  '<h2 style="margin-top: 10px;">KDS Features</h2>' +
  '<br>' +
  '<h3>Assignment Defaults</h3>' +
  '<form>' +
  '<h4>Due Date Defaults</h4>' +
  '<label class="ic-Label">Hour</label>' +
  '<input id="due_hour" name="hour" style="width:50px" type="text" aria-required="true">' +
  ':<input id="due_minute" name="minute" style="width:50px" type="text" aria-required="true">' +
  '<select id="due_period" style="width:75px">' +
  '<option>am</option><option>pm</option></select>' +
  '</form>' +
  '<button id="tweaks_due_button"class="btn btn-primary">Update Default Due Date</button>' +
  '<span id="due_tweak_error" style="padding-left:10px; color:red; display:none">Please enter a time.</span>' +
  '<br>' + 
  '<form><h4>Assignment Type Default</h4>' +
  '<select id="assign_type">' +
  '<option value="percent">Percentage</option>' +
  '<option value="pass_fail">Complete/Incomplete</option>' +
  '<option value="points" selected="">Points</option>' +
  '<option value="letter_grade">Letter Grade</option>' +
  '<option value="gpa_scale">GPA Scale</option>' +
  '<option value="not_graded">Not Graded</option>' +
  '</select>' +
  '</form>' +
  '<button id="tweaks_assign_type_button"class="btn btn-primary">Update Default Assignment Type</button>' +
  '<span id="assign_type_tweak_error" style="padding-left:10px; color:red; display:none">Failed.</span>' +
  '<br><br>' + 
  '<form>' +
  '<h3>Other Options</h3>' +
  '<div class="ic-Checkbox-group"> <div class="ic-Form-control ic-Form-control--checkbox">' +
  '<input type="checkbox" id="syl-assignments">' +
  '<label class="ic-Label" for="syl-assignments">Show assignments on syllabus page</label>' +
  '</div></div>' +
  '</form>' +
  '<button id="tweaks_syllabus_button"class="btn btn-primary">Update Preferences</button>' +
  '<span id="syllabus_tweak_error" style="padding-left:10px; color:red; display:none">Failed.</span>';

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

  if (b) {

  }


});
/*******************************************/

/*
 * disables the to-do list for students, showing only "Coming Up"
 */
isStudent(function(b) {
  if (b) {
    onElementRendered('#right-side > ul.to-do-list', function(el) {
      var dashboardTodo = el;
      if (dashboardTodo.length > 0) {
        $('#right-side > h2')
          .hide();
        dashboardTodo.hide();
        console.log("Hiding dash todo");
      }
    });
    var courseTodo = $('#course_show_secondary > ul.to-do-list');
    if (courseTodo.length > 0) {
      $('#course_show_secondary > h2')
        .hide();
      courseTodo.hide();
      console.log("Hiding course todo");
    }
  }
});
/*
   function to display section number next to course title on all course pages
   */
onPage(/\/courses\/\d+/, function() {
  var id = location.pathname.match(/\d+/)[0];
  $.getJSON("/api/v1/courses/" + id + "?include[]=sections", function(data) {
    if (data.sections.length > 0) {
      var sectionName = data.sections[0].name;
      var courseCrumb = $("#breadcrumbs ul li:eq(1) a span");
      var courseTitle = courseCrumb.html();
      var enrollment = data.enrollments[0].type;
      if (courseTitle != sectionName && enrollment != "teacher") {
        courseCrumb.html(courseCrumb.html() + " (" + sectionName + ")");
      }
    }
  });
});
/*
   function to display section number on dashboard
   */
onPage(/\/$/, function() {
  var dashboardCards = $('#DashboardCard_Container')
    .find('.card');
  dashboardCards.each(function() {
    var curCard = $(this)
      .find('.ic-DashboardCard__link');
    var courseId = curCard.attr('href')
      .split('/')[2];
    $.getJSON("/api/v1/courses/" + courseId + "?include[]=sections", function(data) {
      var sectionName = data.sections[0].name;
      var subtitle = curCard.find('.ic-DashboardCard__header-subtitle');
      var courseTitle = curCard.find('.ic-DashboardCard__header-title')
        .html();
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
    - Ability to show assignments on the syllabus
    - Ability to set a default assignment type
   */
onPage(/\/courses\/\d+\/settings$/, function() {
  var courseId = location.pathname.match(/\d+/)[0];
  var userId = ENV.current_user_id;
  var userData;
  $.getJSON('/api/v1/users/' + userId + '/custom_data?ns=org.kentdenver.canvas', function(data) {
      userData = data;
    })
    .complete(function() {
      var tabs = $('#course_details_tabs');
      tabs.tabs('add', '#tab-tweaks', 'KDS Features');
      $('#tab-tweaks')
        .html(tweakHtml);
      $('#tweaks_due_button')
        .click(function() {
          if (userData.data[courseId] == undefined) {
            userData.data[courseId] = {};
          }
          hour = hourLoc.val();
          min = minLoc.val();
          period = periodLoc.val();
          console.log(userData);
          if (hour && min && period) {
            userData.data[courseId]['due_hour'] = hour;
            userData.data[courseId]['due_min'] = min;
            userData.data[courseId]['due_period'] = period;
            $.put('/api/v1/users/' + userId + '/custom_data', userData.data);
            $('#due_tweak_error')
              .css('color', 'green')
              .html('Success!')
              .show();
          } else {
            $('#due_tweak_error')
              .css('color', 'red')
              .html('Please enter a time.')
              .show();
          }
        });
      $('#tweaks_syllabus_button')
        .click(function() {
          if (userData.data[courseId] == undefined) {
            userData.data[courseId] = {};
          }
          sylPref = sylLoc.prop('checked');
          if (sylPref != undefined) {
            userData.data[courseId]['syl_pref'] = sylPref;
            $.put('/api/v1/users/' + userId + '/custom_data', userData.data);
            $('#syllabus_tweak_error')
              .css('color', 'green')
              .html('Success!')
              .show();
          }
        });
      $('#tweaks_assign_type_button')
        .click(function() {
          if (userData.data[courseId] == undefined) {
            userData.data[courseId] = {};
          }
          assignPref = assignLoc.val();
          if (assignPref != undefined) {
            userData.data[courseId]['assign_type_pref'] = assignPref;
            $.put('/api/v1/users/' + userId + '/custom_data', userData.data);
            $('#assign_type_tweak_error')
              .css('color', 'green')
              .html('Success!')
              .show();
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
      var sylLoc = $('#syl-assignments');
      var assignLoc = $('#assign_type');
      var hour;
      var min;
      var period;
      var sylPref;
      if (courseData != undefined) {
        hour = courseData.due_hour;
        min = courseData.due_min;
        period = courseData.due_period;
        sylPref = courseData.syl_pref;
        assignPref = courseData.assign_type_pref;
        hourLoc.val(hour);
        minLoc.val(min);
        periodLoc.val(period);
        sylLoc.prop('checked', sylPref === 'true');
        assignLoc.val(assignPref);
      }
    });
});
/*
   Due date default implementation, pre fills due date time field with user's custom values
   */
onElementRendered('#bordered-wrapper > div > div:nth-child(2) > div:nth-child(1) > div > div > div > div.input-append > button', datePopout);

function datePopout(el) {
  var courseId = location.pathname.match(/\d+/)[0];
  var userId = ENV.current_user_id;
  var userData;
  $.getJSON('/api/v1/users/' + userId + '/custom_data?ns=org.kentdenver.canvas', function(data) {
    userData = data;
    var courseData = userData.data[courseId];
    el.click(function() {
      $('#ui-datepicker-time-hour')
        .val(courseData.due_hour);
      $('#ui-datepicker-div > div.ui-datepicker-time.ui-corner-bottom > input.ui-datepicker-time-minute')
        .val(courseData.due_min);
      $('#ui-datepicker-div > div.ui-datepicker-time.ui-corner-bottom > select')
        .val(courseData.due_period);
    });
    $('#add_due_date')
      .click(function() {
        setTimeout(function() {
          onElementRendered('#bordered-wrapper > div > div:nth-child(2) > div:nth-child(1) > div > div > div > div.input-append > button', datePopout);
        }, 250);
      });
  });
}

/*
 * Assignment type default implementation 
 */
onElementRendered('#assignment_grading_type', function(el) {
  var courseId = location.pathname.match(/\d+/)[0];
  var userId = ENV.current_user_id;
  var userData;
  $.getJSON('/api/v1/users/' + userId + '/custom_data?ns=org.kentdenver.canvas', function(data) {
    userData = data;
    var courseData = userData.data[courseId];
    el.val(courseData.assign_type_pref);
  });
});
/*
 * Show assignment list on the syllabus page
 */
onElementRendered('#syllabus', function(el) {
  $.getJSON('/api/v1/users/' + userId + '/custom_data?ns=org.kentdenver.canvas', function(data) {
    userData = data;
    var courseId = location.pathname.match(/\d+/)[0];
    var courseData = userData.data[courseId];
    if (courseData.syl_pref === 'true') {
      $('#syllabus')
        .addClass('kent-show');
      $('#content > h2')
        .addClass('kent-show');
    }
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
  $('#preview_frame')
    .load(function() {
      var iframe = $('#preview_frame');
      if (iframe != undefined) {
        var container = iframe.contents()
          .find('#content > div > div.file-upload-submission-attachment');
        var dest = $(container.children()[0])
          .attr('data-crocodoc_session_url'); //live version
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
  for (var i in betaUsers) {
    if (betaUsers[i] == userId) {
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

/*
 * Canvabadges required javascript
 */

$(function() {
  console.log("CANVABADGES: Loaded!");
  // NOTE: if pasting this code into another script, you'll need to manually change the
  // next line. Instead of assigning the value null, you need to assign the value of
  // the Canvabadges domain, i.e. "https://www.canvabadges.org". If you have a custom
  // domain configured then it'll be something like "https://www.canvabadges.org/_my_site"
  // instead.
  var protocol_and_host = "https://www.canvabadges.org";
  if (!protocol_and_host) {
    var $scripts = $("script");
    $("script")
      .each(function() {
        var src = $(this)
          .attr('src');
        if (src && src.match(/canvas_profile_badges/)) {
          var splits = src.split(/\//);
          protocol_and_host = splits[0] + "//" + splits[2];
        }
        var prefix = src && src.match(/\?path_prefix=\/(\w+)/);
        if (prefix && prefix[1]) {
          protocol_and_host = protocol_and_host + "/" + prefix[1];
        }
      });
  }
  if (!protocol_and_host) {
    console.log("CANVABADGES: Couldn't find a valid protocol and host. Canvabadges will not appear on profile pages until this is fixed.");
  }
  var match = location.href.match(/\/(users|about)\/(\d+)$/);
  if (match && protocol_and_host) {
    console.log("CANVABADGES: This page shows badges! Loading...");
    var user_id = match[2];
    var domain = location.host;
    var url = protocol_and_host + "/api/v1/badges/public/" + user_id + "/" + encodeURIComponent(domain) + ".json";
    $.ajax({
      type: 'GET',
      dataType: 'jsonp',
      url: url,
      success: function(data) {
        console.log("CANVABADGES: Data retrieved!");
        if (data.objects && data.objects.length > 0) {
          console.log("CANVABADGES: Badges found! Adding to the page...");
          var $box = $("<div/>", {
            style: 'margin-bottom: 20px;'
          });
          $box.append("<h2 class='border border-b'>Badges</h2>");
          for (idx in data.objects) {
            var badge = data.objects[idx];
            var $badge = $("<div/>", {
              style: 'float: left;'
            });
            var link = protocol_and_host + "/badges/criteria/" + badge.config_id + "/" + badge.config_nonce + "?user=" + badge.nonce;
            var $a = $("<a/>", {
              href: link
            });
            $a.append($("<img/>", {
              src: badge.image_url,
              style: 'width: 72px; height: 72px; padding-right: 10px;'
            }));
            $badge.append($a);
            $box.append($badge);
          }
          $box.append($("<div/>", {
            style: 'clear: left'
          }));
          $("#edit_profile_form,fieldset#courses,.more_user_information + div")
            .after($box);
        } else {
          console.log("CANVABADGES: No badges found for the user: " + user_id + " at " + domain);
        }
      },
      error: function(err) {
        console.log("CANVABADGES: Badges failed to load, API error response");
        console.log(err);
      },
      timeout: 5000
    });
  } else {
    console.log("CANVABADGES: This page doesn't show badges");
  }
});
