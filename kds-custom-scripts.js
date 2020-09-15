/*EvaluationKIT START*/
let evalkit_jshosted = document.createElement('script');
evalkit_jshosted.setAttribute('type', 'text/javascript');
evalkit_jshosted.setAttribute('src', 'https://kentdenver.evaluationkit.com/CanvasScripts/kentdenver.js?v=2');
document.getElementsByTagName('head')[0].appendChild(evalkit_jshosted);
/*EvaluationKIT END*/

//Users are aclement, aimhoff, bsimmons, scohen, aoro, hlindsay, mlewis, tham, ahoff, jhuh, ...
//cmarsh, wmattingly, emaxey, pramurthy, srubin, asaffold, rschaffer, ssveen, pwang, ewaters, jzhou

const betaUsers = ["834", "1797"];

const kdsApiUrl = "https://kdsapi.org/schedule";


const tweakHtml = `
    <h2 style="margin-top: 10px;">KDS Features</h2> 
    <br> 
    <h3>Assignment Defaults</h3> 
    <form> 
    <h4>Due Date Defaults</h4> 
    <label class="ic-Label">Hour</label> 
    <input id="due_hour" name="hour" style="width:50px" type="text" aria-required="true"> 
    :<input id="due_minute" name="minute" style="width:50px" type="text" aria-required="true"> 
    <select id="due_period" style="width:75px"> 
    <option>am</option><option>pm</option></select> 
    </form> 
    <button id="tweaks_due_button" class="btn btn-primary">Update Default Due Date</button> 
    <span id="due_tweak_error" style="padding-left:10px; color:red; display:none">Please enter a time.</span> 
    <br>
    <form> 
    <h4>Number of Future Class Meetings</h4> 
    <input id="future_dates" name="future_dates" style="width:50px" type="text" aria-required="true"> 
    </form> 
    <button id="future_dates_button" class="btn btn-primary">Update Number</button>
    <span id="future_dates_tweak_error" style="padding-left:10px; color:red; display:none">Failed.</span> 
    <form><h4>Assignment Type Default</h4> 
    <select id="assign_type"> 
    <option value="percent">Percentage</option> 
    <option value="pass_fail">Complete/Incomplete</option> 
    <option value="points" selected="">Points</option> 
    <option value="letter_grade">Letter Grade</option> 
    <option value="gpa_scale">GPA Scale</option> 
    <option value="not_graded">Not Graded</option> 
    </select> 
    </form> 
    <button id="tweaks_assign_type_button" class="btn btn-primary">Update Default Assignment Type</button> 
    <span id="assign_type_tweak_error" style="padding-left:10px; color:red; display:none">Failed.</span> 
    <br><br> 
    <form> 
    <h3>Other Options</h3> 
    <div class="ic-Checkbox-group"> <div class="ic-Form-control ic-Form-control--checkbox"> 
    <input type="checkbox" id="syl-assignments"> 
    <label class="ic-Label" for="syl-assignments">Show assignments on syllabus page</label> 
    </div></div> 
    </form> 
    <button id="tweaks_syllabus_button" class="btn btn-primary">Update Preferences</button> 
    <span id="syllabus_tweak_error" style="padding-left:10px; color:red; display:none">Failed.</span>`;



const upcomingBtnHtml = `<button id="upcoming_btn" type="button" class="btn" aria-hidden="true" tabindex="-1"><i class="icon-timer"></i></button>`;
const upcomingDropdown = `<div id="upcoming_dropdown" class="ic-tokeninput-list" role="listbox" style="display: none;"></div>`;
const upcomingDropdownHeader = `<div class="ic-tokeninput-header" value="" role="option" tabindex="-1" ></div>`;
const upcomingDropdownOption = `<div value="" role="option" tabindex="-1" class="ic-tokeninput-option" ></div>`;
const noHomeworkBtn = (perNum) => `<button type="button" class="Button button-sidebar-wide"><i class="icon-check" aria-hidden="true"></i><span>&nbsp;</span><span>No Homework for Period ${perNum}</span></button>`;

function zoomLinkTemplate(sections) {
    let htmlToInsert = $(`
            <div class="events_list coming_up">
              <div class="h2 shared-space">
                <h2>Zoom Links</h2>
              </div>
              <ul class="right-side-list events" id="zoom_list">`);
    return new Promise(function(resolve, reject) {
        let sectionPromises = [];
        let otherSection;
        for (let sectionObj of sections) {
            let curPromise = $.get(`https://kdsapi.org/zoom/${sectionObj.id}`);
            curPromise.done(function (result) {
                if(result && result.url) {
                    if(!(otherSection && otherSection.url === result.url && otherSection.name === otherSection.name)) {
                        htmlToInsert.append(`
                            <li style="list-style-type: none;" >
                            <small>
                                <a href="${result.url}" target="_blank">${result.name}</a>
                            </small>
                            </li>`
                        );
                        otherSection = result;
                    }

                }
            });
            sectionPromises.push(curPromise);
        }
        Promise.all(sectionPromises).then(function () {
            let targetElement = $('#right-side');
            htmlToInsert.append(`</ul></div>`);
            targetElement.append(htmlToInsert);
        });
    });

}



//disable high contrast styles option on user preferences
onPage(/\/profile/, function () {
    onElementRendered('#ff_toggle_high_contrast', function (el) {
        el.attr('disabled', 'disabled');
    });
});

/*
 ************ Beta Section *****************
 */
isBetaUser(function (b) {

    if (b) {
        /*
         * Tests related to advising and user observers
         */
        // onPage(/\/courses$/, function () {
        //     let current_enrollments = document.querySelector("#my_courses_table").querySelectorAll("tr");
        //     let past_enrollments = document.querySelector("#past_enrollments_table").querySelectorAll("tr");
        //     for(let i = 0; i < current_enrollments.length; i++) {
        //         let a = current_enrollments[i];
        //         let type = a.querySelector(".course-list-enrolled-as-column").innerText;
        //         if(type === "Observer") {
        //             a.style.display = "none";
        //         }
        //     }
        //     for(let i = 0; i < past_enrollments.length; i++) {
        //         let a = past_enrollments[i];
        //         let type = a.querySelector(".course-list-enrolled-as-column").innerText;
        //         if(type === "Observer") {
        //             a.style.display = "none";
        //         }
        //     }
        // });

    }


});
/*******************************************/

/*
 * disables the to-do list for students, showing only "Coming Up"
 */
isStudent(function (b) {
    if (b) {
        onElementRendered('#right-side > ul.to-do-list', function (el) {
            const dashboardTodo = el;
            if (dashboardTodo.length > 0) {
                $('#right-side').children(h2)
                    .hide();
                dashboardTodo.hide();
            }
        });
        const secondary = $('#course_show_secondary');
        const courseTodo = secondary.children('ul.to-do-list');
        if (courseTodo.length > 0) {
            secondary.children('h2')
                .hide();
            courseTodo.hide();
        }
    }
});
/*
 Hide calendar on the syllabus page
 */
onPage(/\/courses\/\d+\/assignments\/syllabus/, function () {
   let rightSide = document.querySelector("#right-side-wrapper");
   rightSide.parentElement.removeChild(rightSide);
});
/*
 function to:
  - display section number next to course title on all course pages
  - Add No Homework buttons
  - Display Zoom link

 */
onPage(/\/courses\/\d+/, function () {
    const id = location.pathname.match(/\d+/)[0];
    $.getJSON("/api/v1/courses/" + id + "?include[]=sections", function (data) {
        if (data.sections.length > 0) {
            const sectionName = data.sections[0].name;
            const courseCrumb = $("#breadcrumbs").find("ul li:eq(1) a span");
            const courseTitle = courseCrumb.html();
            let enrollment;
            if(data.enrollments[0]) {
                enrollment = data.enrollments[0].type;
            }
            if (courseTitle !== sectionName && enrollment !== "teacher") {
                courseCrumb.html(courseCrumb.html() + " (" + sectionName + ")");
            }
            /*
            Zoom Links
             */
            zoomLinkTemplate(data.sections);
            /*
             No Homework only on course homepage
             */
            if (enrollment === "teacher" && location.pathname.match(/\/courses\/\d+$/)) {
                const termText = document.getElementById("section-tabs-header-subtitle").innerText;
                const term = termText.indexOf("KDS MS") >= 0 ? "MS" : "US";
                let htmlToInsert = $('<div></div>');
                let sectionPromises = [];
                for (let sectionObj of data.sections) {
                    let nameSplit = sectionObj.name.match(/.*([1-6])F.* - .* \(.*\)/);
                    if (nameSplit) {                    
                        let section = nameSplit[1];
                        let tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(6);
                        let curPromise = $.get(`${kdsApiUrl}/${term}/next_occurrence?date=${tomorrow.toISOString()}&maxResults=1&type=period&identifier=Period ${section}`);
                        curPromise.done(function (nextOccur) {
                            let newBtn = $(noHomeworkBtn(section));
                            newBtn.click(function () {
                                makeNoHomework(nextOccur[0].start_time, section, sectionObj);
                            });
                            htmlToInsert.append(newBtn);
                        });
                        sectionPromises.push(curPromise);
                    }
                }
                Promise.all(sectionPromises).then(function () {
                    let targetElement = $('#course_show_secondary').find('div.course-options');
                    targetElement.append(htmlToInsert);
                });

            }
        }
    });
});
/*
 function to display section number on dashboard
 */
onPage(/\/$/, function () {
    ENV.DASHBOARD_COURSES.forEach(function (e) {
        $.getJSON("/api/v1/courses/" + e.id + "?include[]=sections", function (data) {
            const curCard = $('.ic-DashboardCard[aria-label="' + e.originalName + '"]');
            const sectionName = data.sections[0].name;
            const subtitle = curCard.find('.ic-DashboardCard__header-subtitle');
            const courseTitle = curCard.find('.ic-DashboardCard__header-title')
                .html();
            const enrollment = data.enrollments[0].type;
            if (courseTitle !== sectionName && enrollment !== "teacher") {
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
onPage(/\/courses\/\d+\/settings$/, function () {
    const courseId = location.pathname.match(/\d+/)[0];
    const userId = ENV.current_user_id;
    let userData;
    let assignPref;
    let futureNumber;
    let courseData;
    $.getJSON('/api/v1/users/' + userId + '/custom_data?ns=org.kentdenver.canvas', function (data) {
        userData = data;
    })
        .complete(function () {
            console.log(userData);
            const tabs = $('#course_details_tabs');
            tabs.tabs('add', '#tab-tweaks', 'KDS Features');
            $('#tab-tweaks')
                .html(tweakHtml);
            $('#tweaks_due_button')
                .click(function () {
                    if (userData.data[courseId] === undefined) {
                        userData.data[courseId] = {};
                    }
                    hour = hourLoc.val();
                    min = minLoc.val();
                    period = periodLoc.val();
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
                .click(function () {
                    if (userData.data[courseId] === undefined) {
                        userData.data[courseId] = {};
                    }
                    sylPref = sylLoc.prop('checked');
                    if (sylPref !== undefined) {
                        userData.data[courseId]['syl_pref'] = sylPref;
                        $.put('/api/v1/users/' + userId + '/custom_data', userData.data);
                        $('#syllabus_tweak_error')
                            .css('color', 'green')
                            .html('Success!')
                            .show();
                    }
                });
            $('#tweaks_assign_type_button')
                .click(function () {
                    if (userData.data[courseId] === undefined) {
                        userData.data[courseId] = {};
                    }
                    assignPref = assignLoc.val();
                    if (assignPref !== undefined) {
                        userData.data[courseId]['assign_type_pref'] = assignPref;
                        $.put('/api/v1/users/' + userId + '/custom_data', userData.data);
                        $('#assign_type_tweak_error')
                            .css('color', 'green')
                            .html('Success!')
                            .show();
                    }
                });
            $('#future_dates_button')
                .click(function() {
                    if (userData.data[courseId] === undefined) {
                        userData.data[courseId] = {};
                    }
                    assignPref = futureLoc.val();
                    if (assignPref !== undefined) {
                        userData.data[courseId]['future_number'] = assignPref;
                        $.put('/api/v1/users/' + userId + '/custom_data', userData.data);
                        $('#future_dates_tweak_error')
                            .css('color', 'green')
                            .html('Success!')
                            .show();
                    }
                });
            if (userData !== undefined) {
                courseData = userData.data[courseId];
            } else {
                userData = {
                    data: {}
                }
            }
            const hourLoc = $('#due_hour');
            const minLoc = $('#due_minute');
            const periodLoc = $('#due_period');
            const sylLoc = $('#syl-assignments');
            const assignLoc = $('#assign_type');
            const futureLoc = $('#future_dates');
            let hour;
            let min;
            let period;
            let sylPref;
            if (courseData !== undefined) {
                hour = courseData.due_hour;
                min = courseData.due_min;
                period = courseData.due_period;
                sylPref = courseData.syl_pref;
                assignPref = courseData.assign_type_pref;
                futureNumber = courseData.future_number;
                hourLoc.val(hour);
                minLoc.val(min);
                periodLoc.val(period);
                sylLoc.prop('checked', sylPref === 'true');
                assignLoc.val(assignPref);
                futureLoc.val(futureNumber);
            }
        });
});

/*
 * Assignment type default implementation
 */
onPage(/courses\/\d+\/assignments\/new/, function () {
    onElementRendered('#assignment_grading_type', function (el) {
        const courseId = location.pathname.match(/\d+/)[0];
        const userId = ENV.current_user_id;
        let userData;
        $.getJSON('/api/v1/users/' + userId + '/custom_data?ns=org.kentdenver.canvas', function (data) {
            userData = data;
            const courseData = userData.data[courseId];
            if (courseData && courseData.assign_type_pref) {
                el.val(courseData.assign_type_pref);
            }
        });
    });
});
/*
 * Show assignment list on the syllabus page
 */
onElementRendered('#syllabus', function () {
    $.getJSON('/api/v1/users/' + userId + '/custom_data?ns=org.kentdenver.canvas', function (data) {
        userData = data;
        const courseId = location.pathname.match(/\d+/)[0];
        const courseData = userData.data[courseId];
        if (courseData.syl_pref === 'true') {
            $('#syllabus')
                .addClass('kent-show');
            $('#content').children('h2')
                .addClass('kent-show');
        }
    });
});


/*
 Adds link to view crocodoc feedback in full tab
 */
onPage(/courses\/\d+\/assignments\/\d+\/submissions\/\d+/, function () {
    $('#preview_frame')
        .load(function () {
            const iframe = $('#preview_frame');
            if (iframe !== undefined) {
                const container = iframe.contents()
                    .find('#content > div > div.file-upload-submission-attachment');
                const dest = $(container.children()[0])
                    .attr('data-crocodoc_session_url'); //live version
                const contHTML = container.html();
                container.html('<p>' + contHTML + '&nbsp;&nbsp;<a href="' + dest + '" target="_blank">View in New Tab</a></p>')
            }
        });
});

/*
 Due date default implementation, pre fills due date time field with user's custom values
 Adds button to due date that allows teacher to select one of the five next class meetings as the due date
 */
onElementRendered('#bordered-wrapper > div > div > div > div > div > div > div.input-append > button.ui-datepicker-trigger', datePopout);

function datePopout(els) {
    for(let i = 0; i < els.length; i++) {
        let el = $(els[i]);
        if (!el.hasClass("date_added")) {
            $('#add_due_date')
                .click(function () {
                    setTimeout(function () {
                        onElementRendered('#bordered-wrapper > div > div:nth-child(3) > div:nth-child(1) > div > div > div > div.input-append > button.ui-datepicker-trigger', datePopout);
                    }, 250);
                });
            el.addClass("date_added");
            const courseId = location.pathname.match(/\d+/)[0];
            const userId = ENV.current_user_id;
            let userData;
            $.getJSON('/api/v1/users/' + userId + '/custom_data?ns=org.kentdenver.canvas', function (data) {
                userData = data;
            }).always(function() {
                let courseData;
                if(userData) {
                    courseData = userData.data[courseId];
                }
                if(courseData) {
                    el.click(function () {
                        $('#ui-datepicker-time-hour')
                            .val(courseData.due_hour);
                        const ui = $('#ui-datepicker-div');
                        ui.find('div.ui-datepicker-time.ui-corner-bottom > input.ui-datepicker-time-minute')
                            .val(courseData.due_min);
                        ui.find('div.ui-datepicker-time.ui-corner-bottom > select')
                            .val(courseData.due_period);
                    });
                }
                const sections = [];
                for (let section of ENV.SECTION_LIST) {
                    let nameSplit = section.name.match(/.*([1-6])F.* - .* \(.*\)/);
                    if (nameSplit) {
                        sections.push(nameSplit[1]);
                    }
                }
                const termText = document.getElementById("section-tabs-header-subtitle").innerText;
                const term = termText.indexOf("KDS MS") >= 0 ? "MS" : "US";
                if (term === "MS" || term === "US") {
                    let dropdownHtmlToInsert = $(upcomingDropdown);
                    let sectionPromises = [];
                    let today = new Date();
                    let maxResults = 5;
                    if(courseData && courseData.future_number) {
                        maxResults = courseData.future_number;
                    }
                    for (let section of sections) {
                        let curPromise = $.get(`${kdsApiUrl}/${term}/next_occurrence?date=${today.toISOString()}&maxResults=${maxResults}&type=period&identifier=Period ${section}`);
                        sectionPromises.push(curPromise);
                    }
                    Promise.all(sectionPromises).then(function (list) {
                        list.sort(function(a, b) {
                            return  parseInt(a[0].title.replace("Period ", "")) - parseInt(b[0].title.replace("Period ", ""));
                        });
                        for(let j = 0; j < list.length; j++) {
                            let data = list[j];
                            let cur_section = data[0].title.replace("Period ", "");
                            let header = $(upcomingDropdownHeader).val(`section_${cur_section}`).html(`Period ${cur_section}`);
                            dropdownHtmlToInsert.append(header);
                            for (let entry of data) {
                                let prettyTime = new Date(entry.start_time).toLocaleString('en-US', {
                                    weekday: "short",
                                    month: 'short',
                                    day: 'numeric',
                                    year: "numeric",
                                    hour: 'numeric',
                                    minute: 'numeric'
                                }).replace(/(\d{4}),/, '$1 at');
                                let item = $(upcomingDropdownOption).val(entry.start_time).html(`<b>${entry.linked_day[0].type}</b> - ${prettyTime}`);
                                item.click(function (clickedEl) {
                                    let inputTarget = $(clickedEl.target).parents('div.input-append').find('input');
                                    inputTarget.val(entry.start_time).change();
                                });
                                dropdownHtmlToInsert.append(item);
                            }
                        }
                        let targetElement = el.parent();
                        targetElement.find('input').width(239);
                        let newButton = $(upcomingBtnHtml).click(function (event) {
                            dropdownHtmlToInsert.toggle();
                            event.stopPropagation();
                        });
                        targetElement.append(newButton);
                        $(document).click(function () {
                            if (dropdownHtmlToInsert.is(":visible")) {
                                dropdownHtmlToInsert.hide();
                            }
                        })
                        targetElement.append(dropdownHtmlToInsert);

                    });
                }
            });

        }
    }
}

/*
  No homework helper function
 */

function makeNoHomework(startTime, section, sectionObj) {
    const id = location.pathname.match(/\d+/)[0];
    let newAssignment = {
        "assignment": {
            "name": "No Homework",
            "description": "No Homework",
            "assignment_overrides": [{
                "course_section_id": sectionObj.id,
                "due_at": startTime,
            }],
            "submission_types": "not_graded",
            "grading_type": "not_graded",
            "only_visible_to_overrides": "true",
            "published": "true"
        }
    };
    let prettyTime = new Date(startTime).toLocaleString('en-US', {
        weekday: "short",
        month: 'short',
        day: 'numeric',
        year: "numeric",
        hour: 'numeric',
        minute: 'numeric'
    }).replace(/(\d{4}),/, '$1 at');
    $(`<div title="No Homework for Period ${section}">
                                   <p>Are you sure that you want to create this new assignment:
                                   <br><br><b>No Homework</b><br>${sectionObj.name}<br>${prettyTime}</p><br></div>`).dialog({
        buttons: [{
            text: "Yes",
            click: function () {
                let dialog = this;
                $.post("/api/v1/courses/" + id + "/assignments", newAssignment, function (response) {
                    console.log(response);
                    $(dialog).dialog("close");
                });
            }
        }, {
            text: "No",
            click: function () {
                $(this).dialog("close");
            }
        }
        ]
    });

}


/*
 Waits for 30 seconds to see if an element is rendered
 */
function onElementRendered(selector, cb, _attempts) {
    const el = $(selector);
    _attempts = ++_attempts || 1;
    if (el.length) return cb(el);
    if (_attempts === 120) return;
    setTimeout(function () {
        onElementRendered(selector, cb, _attempts);
    }, 250);
}
/*
 * Check if iFrame is rendered
 */

function oniFrameRendered(selector, cb, _attempts) {
    const targetFrame = $(selector);
    _attempts = ++_attempts || 1;
    if (targetFrame.contents()[0] !== undefined && targetFrame.contents()[0].readyState === "complete") {
        targetFrame.on('load', function (e) {
            return cb(targetFrame);
        });
    }
    if (_attempts === 120) return;
    setTimeout(function () {
        oniFrameRendered(selector, cb, _attempts);
    }, 250);
}

/*
 Limits functions to only run on pages that match the provided regex
 */
function onPage(regex, fn) {
    if (location.pathname.match(regex)) fn();
}

/*
 * Function to only run code for certain users
 */

function isUser(id, cb) {
    cb(ENV.current_user_id === id);
}

function isStudent(cb) {
    cb(ENV.current_user_roles.indexOf('teacher') < 0);
}

function isBetaUser(cb) {
    userId = ENV.current_user_id;
    let betaUser = false;
    for (const i in betaUsers) {
        if (betaUsers.hasOwnProperty(i) && betaUsers[i] === userId) {
            betaUser = true;
            break;
        }
    }
    cb(betaUser);
}
/*
 Makes an HTTP PUT request designed for custom_data
 */
$.put = function (url, data) {
    return $.ajax({
        url: url,
        type: "PUT",
        dataType: 'json',
        data: {
            ns: 'org.kentdenver.canvas',
            data: data
        }
    });
};
/* JQuery UI Wigetize */

!function (s, d, url, e, p) {
    e = d.createElement(s), p = d.getElementsByTagName(s)[0];
    e.async = 1;
    e.src = url;
    p.parentNode.insertBefore(e, p)
}('script', document, 'https://kdsweb.kentdenver.org/resources/widgetize.js');

