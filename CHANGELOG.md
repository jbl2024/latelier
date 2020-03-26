# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed
- Fix pending task count on dashboard
- Project wheather: improve tasks loading & fix duplicates

### Removed

## [2.10.2] - 2020-03-25

### Added

### Changed
- Add sticky position on task detail & tasks list tabs
- Firefox: do not hide scrollbar

### Removed

## [2.10.1] - 2020-03-22

### Added
- Add projects in administration pages (actions: view/move to trash/delete)
- Display completed info in tasks list

### Changed
- Fix list move bug when moving created list to first row
- Weather reports: display reports within 2 side panes

### Removed

## [2.10.0] - 2020-03-14

### Added

### Changed
- Replace vue2-editor with tiptap (see https://github.com/scrumpy/tiptap)
- Improve dialogs on mobile (no more fullscreen everywhere)
- Update vuetify to 2.2.15
- Fix icons display in task items (weird behavior in ff74)

### Removed

## [2.9.2] - 2020-02-13

### Added
- Docker configuration files
- Storage: S3 support for attachments & avatars

### Changed
- Fix profile page first time display
- Fix missing translation

### Removed

## [2.9.1] - 2020-02-11

### Added
- Basic key figures for administrator
- Conditional email verification setting

### Changed
- Better clear notifications icon
- Improve code readability for internal notifications (snackbars)
- Admin rights are checked and set if needed at login

### Removed

## [2.9.0] - 2020-01-26

### Added
- BPMN examples (templates)

### Changed
- Fix check admin in project methods
- Improve bpmn edition
- Update packages:
  - bpmn-js to 6.2.0
  - diagram-js-minimap to 2.0.3

### Removed

## [2.8.0] - 2020-01-20

### Added
- Prefix for emails

### Changed
- Fix unit test exit
- Improve favorite project card display
- Update vuetify to 2.2.4
- Update to Meteor 1.9
- Update packages:
  - accounts-base              upgraded from 1.4.5 to 1.5.0
  - babel-compiler             upgraded from 7.4.2 to 7.5.0
  - babel-runtime              upgraded from 1.4.0 to 1.5.0
  - callback-hook              upgraded from 1.2.0 to 1.3.0
  - ecmascript                 upgraded from 0.13.2 to 0.14.0
  - ecmascript-runtime-client  upgraded from 0.9.0 to 0.10.0
  - ecmascript-runtime-server  upgraded from 0.8.0 to 0.9.0
  - minifier-css               upgraded from 1.4.3 to 1.5.0
  - minifier-js                upgraded from 2.5.1 to 2.6.0
  - modules                    upgraded from 0.14.0 to 0.15.0
  - modules-runtime            upgraded from 0.11.0 to 0.12.0
  - mongo                      upgraded from 1.7.0 to 1.8.0
  - npm-mongo                  upgraded from 3.2.0 to 3.3.0
  - standard-minifier-css      upgraded from 1.5.4 to 1.6.0
  - standard-minifier-js       upgraded from 2.5.2 to 2.6.0
  - webapp                     upgraded from 1.7.5 to 1.8.0
  - accounts-password          upgraded from 1.5.2 to 1.5.3
  - meteortesting:mocha        upgraded from 1.1.3 to 1.1.4
  - meteortesting:mocha-core*  upgraded from 6.2.2 to 7.0.0
  - modern-browsers            upgraded from 0.1.4 to 0.1.5

### Removed
- Dependency to  simonhochrein:meteor-mjml (not compatible with nodejs >= 12)

## [2.7.3] - 2020-01-13

### Added

### Changed
- Remove symlink for diagram-js-minimap (see https://github.com/meteor/meteor/pull/10603)
- Select user dialog: allow search in all tabs, update ux to looks like SelectLabel
- Select label dialog: allow search

### Removed

## [2.7.2] - 2020-01-12

### Added
- Project dashboard
- Update vuetify to 2.1.14

### Changed
- Regenerate background thumbnail if thumbnail file is missing
- Task description is automatically saved when clicking outside or closing task detail
- Canvas item is automatically saved when clicking outside text area
- Update to Meteor 1.8.3
- Update packages:
  - accounts-base              upgraded from 1.4.4 to 1.4.5
  - accounts-password          upgraded from 1.5.1 to 1.5.2
  - babel-compiler             upgraded from 7.3.4 to 7.4.2
  - babel-runtime              upgraded from 1.3.0 to 1.4.0
  - callback-hook              upgraded from 1.1.0 to 1.2.0
  - ecmascript                 upgraded from 0.12.7 to 0.13.2
  - ecmascript-runtime-client  upgraded from 0.8.0 to 0.9.0
  - ecmascript-runtime-server  upgraded from 0.7.1 to 0.8.0
  - minifier-css               upgraded from 1.4.2 to 1.4.3
  - minifier-js                upgraded from 2.4.1 to 2.5.1
  - modules                    upgraded from 0.13.0 to 0.14.0
  - modules-runtime            upgraded from 0.10.3 to 0.11.0
  - mongo                      upgraded from 1.6.3 to 1.7.0
  - npm-mongo                  upgraded from 3.1.2 to 3.2.0
  - standard-minifier-css      upgraded from 1.5.3 to 1.5.4
  - standard-minifier-js       upgraded from 2.4.1 to 2.5.2
  - webapp                     upgraded from 1.7.4 to 1.7.5
  - akryum:vue-component       upgraded from 0.15.1 to 0.15.2
  - blaze                      upgraded from 2.3.3 to 2.3.4
  - ejson                      upgraded from 1.1.0 to 1.1.1
  - ostrio:cookies             upgraded from 2.4.1 to 2.5.0
  - ostrio:files               upgraded from 1.12.2 to 1.13.0
  - reywood:publish-composite  upgraded from 1.7.2 to 1.7.3

### Removed

## [2.7.1] - 2019-12-11

### Added
- Tasks Digest per project, sent to user if subscribed

### Changed
- Labels are kept when converting item to task
- Health report: date + 1 day is used to find tasks

### Removed

## [2.7.0] - 2019-12-01

### Added
- Export project tasks list to office (calc & excel) format
- Export single task to office formats
- Search box
- Link to settings in organization page without any projects
- Export canvas to open document format (ods)

### Changed
- Fix task selection behavior
- Edit health reports in full screen page
- Fix icons when editing health report
- Fix autofocus
- Improve date parsing in timeline (fix error on safari)
- Scroll to selected task if outside viewport

### Removed

## [2.6.4] - 2019-11-08

### Added

### Changed
- Disable dynamic import on firefox <= 60 

### Removed

## [2.6.3] - 2019-11-06

### Added

### Changed
- Fix duplicate task missing notes & checklist

### Removed

## [2.6.2] - 2019-11-05

### Added

### Changed
- Fix wrong tasks display on dashboard
- Fix task estimation & spent display

### Removed

## [2.6.1] - 2019-11-05

### Added

### Changed
- Fix errors thrown in console in health report page
- Update occitan translation, by Quenty31
- Disable client creation
- Improve keyboard navigation
- Updated packages:
  - mobile-drag-drop@2.3.0-rc.2
  - vue-router@3.1.3
  - vue-dragscroll@1.10.2
  - @babel/runtime@7.6.3
  - showdown@1.9.1
  - vue-i18n@8.15.0
  - vue-hot-reload-api@2.3.4
  - vue2-editor@2.10.2
  - vuetify@2.1.9

### Removed

## [2.6.0] - 2019-11-02

### Added
- Move task without drag & drop
- eslint support
- Clone task to another project
- Attachments are cloned when cloning a task or project
- BPMN: export to xml

### Changed
- Improve keyboard navigation
- Improve task permission checking
- Lazy load big components (bpmn & visjs)
- Update SortableJS to 1.10.1
- All code is updated to respect the eslint custom rules
- Update occitan translation, by Quenty31
- Update packages :
  - akryum:vue-component             upgraded from 0.15.0 to 0.15.1
  - akryum:vue-component-dev-client  upgraded from 0.4.6 to 0.4.7
  - alanning:roles                   upgraded from 1.2.16 to 1.2.19
  - base64                           upgraded from 1.0.11 to 1.0.12
  - konecty:user-presence            upgraded from 2.4.0 to 2.6.0
  - matb33:collection-hooks          upgraded from 0.8.4 to 0.9.1
  - meteortesting:browser-tests      upgraded from 1.2.0 to 1.3.1
  - meteortesting:mocha              upgraded from 1.1.2 to 1.1.3
  - meteortesting:mocha-core         upgraded from 6.1.2 to 6.2.2
  - mongo                            upgraded from 1.6.2 to 1.6.3
  - ostrio:cookies                   upgraded from 2.3.0 to 2.4.1
  - ostrio:files                     upgraded from 1.10.2 to 1.12.2
  - peerlibrary:computed-field       upgraded from 0.9.0 to 0.10.0
  - reywood:publish-composite        upgraded from 1.7.0 to 1.7.2

### Removed

## [2.5.0] - 2019-10-13

### Added
- Schemas for collections

### Changed
- Update occitan translation, by Quenty31
- Fix health report update when description is empty
- Fix reminder detection
- Notes are displayed like in chat messaging apps (bubbles)
- Update vuetify to 2.1.3

### Removed
- Project estimated size
- vue-color dependency (use vuetify color picker)

## [2.4.1] - 2019-10-08

### Added

### Changed
- Fix navigation from project to organization when user is not member of organization
- Fix i18n for "clone project" dialog
- Give admin rights to user when cloning a project
- Do not display empty state on project timeline
- Fix avatar wrong orientation display

### Removed
- Useless changelog statements

## [Unreleased]

### [2.4.0] - 2019-10-07
- Support for meteor-elastic-apm (see https://github.com/kschingiz/meteor-elastic-apm)
- Improve project timeline
- Improve projects timeline (move, resize, access to project menu)

### Changed
- Update vuetify to 2.1.1
- Fix i18n on projects timeline
- Update occitan translation, by Quenty31
- Fix warning color on date
- Do not display label on dashboard

### Removed


## [2.3.0] - 2019-09-30

### Added
- Display warning color & icon when task due date is over
- Avatar support

### Changed
- Fix missing attachment icon
- Minor fixes (console.log statements, i18n)

### Removed


## [2.2.4] - 2019-09-23

### Added
- Label text can be displayed by clicking on it

### Changed
- Update occitan translation, by Quenty31
- Improve color brightness detection
- Fix task filter on dashboard when not admin

### Removed

## [2.2.3] - 2019-09-17

### Added

### Changed
- Save canvas: do not use temp object & fix cancel behavior

### Removed

## [2.2.2] - 2019-09-17

### Added

### Changed
- Fix canvas save method
- Update vue2vis to 0.0.16
- Update packages (npm audit fix)

### Removed

## [2.2.1] - 2019-09-15

### Added
- Reminder: 1 week before

### Changed
- Multiple uploads enabled on single task
- Email notifications are enabled by default
- Update occitan translation, by Quenty31
- Upgrade to vuetify@2.0.9

### Removed

## [2.2.0] - 2019-08-18
### Added
- Permissions on organization are propagated to projects

### Changed

### Removed

## [2.1.2] - 2019-08-17
### Added

### Changed
- Improve dialog display when height is small

### Removed

## [2.1.1] - 2019-08-17
### Added

### Changed
- Synchronization between watchers & assignee
- Fix list name size

### Removed

## [2.1.0] - 2019-08-16
### Added
- Background thumbnails
- NASA background
- Notes on task: always display note editor
- When creating task, user is added as watcher
- Migrate to Material Design Icons (https://materialdesignicons.com/)
- Notifications can be mark as read & deleted in bulk
- Update occitan translation, by Quenty31

### Changed
- Improve edit task name (textarea in task detail, cancel restore previous name in list view)
- Improve health cards display when task is selected
- Send notification only to assigned to & watchers
- Upgraded vue2-editor to latest version (2.10.0)
- Upgrade to vuetify@2.0.7

### Removed
- Google Material Icons

## [2.0.0] - 2019-08-11
### Added

### Changed
- Upgrade to vuetify 2.0

### Removed

## [1.8.1] - 2019-08-10
### Added
- Completed tasks are displayed in weather report
- Settings to restrict user search & invitation to admin only 

### Changed
- Fix i18n string with dot 
- When creating task in completed list, completedAt field is correctly set
- Fixtures emails are generated using @latelierdesprojets.fr
- Update README.md
- Health reports are loaded with meteor method instead of publication

### Removed

## [1.8.0] - 2019-08-03
### Added
- More i18n translations
- Edit list name right after creation
- Task reminder
- Notifications
- Watchers

### Changed
- Display previous members in project filter toolbar
- Select user widget now display 3 tabs: project members/organization members/find

### Removed

## [1.7.8] - 2019-07-21
### Added
- Members can leave project

### Changed
- Prevent page refresh when form is submited with enter key on Edit label dialog
- Link in task detail in dashboard opens task in project (instead of project only)
- Files are displayed in dedicated tab on task property
- Fix attachments page display when a task is soft deleted
- Upgraded lodash version to 4.17.15

### Removed
- Resources

## [1.7.7] - 2019-07-06
### Added
- Changelog
- Occitan translation (on main i18n file), by Quenty31
- More translations
- Drop file on list & task to add attachment

### Changed
- Display label name color according to background on project toolbar
- Display list name color & button according to background
- Display hidden tasks when search filter is set
- Split i18n main file in one file per language
- Upgraded packages to latest version 
  + vue-dragscroll@1.10.0
  + bpmn-js@3.5.0
  + vue2-editor@2.9.1
  + file-saver@2.0.2
  + @babel/runtime@7.5.1
  + vue-router@3.0.7
  + vuetify@1.5.16
