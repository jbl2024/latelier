# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- More i18n translations

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
