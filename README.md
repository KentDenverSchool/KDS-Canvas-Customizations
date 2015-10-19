## KDS Canvas Customizations

This repo contains the custom CSS and Javascript for Kent Denver School's instance of Canvas.

The test branch is deployed and running on our Canvas test instance while the master branch is deployed to the main Canvas instance.

#### Features implemented so far are:

##### Master
- Section display for students who are in a course with several cross-listed sections
- The ability to set due date default time for assignments and quizzes
  - These are controlled on the "KDS Features" tab within Course Settings

##### Test
- Fixes the display of files that are embeded from Google Drive, but are not native to Google Docs
    - Does this by switching the files to display in preview mode
- Under the student submission view, add a link to the same submission that opens it in a new tab. This allows students to view feedback on the document more easily
- Speedgrader tweaks:
 - Add a new "Update Scores" button to the right sidebar


### Planned Features

- Allow users to set the default point value for new assignments. If the default is set and the points field is changed to 0, update assignment submission type to "No submission"

###### Feel free to submit any feature requests with a pull request or an issue
