import { Meteor } from 'meteor/meteor';
import { Projects } from '../projects';

// This code only runs on the server
Meteor.publish('projects', function projectsPublication() {
  return Projects.find();
});

Meteor.publish('project', function project(projectId) {
  return Projects.find({ _id: projectId });
});
