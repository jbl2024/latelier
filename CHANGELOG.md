# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Display warning color & icon when task due date is over
- Avatar support

### Changed
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
