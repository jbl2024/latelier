import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Projects = new Mongo.Collection('projects');

Meteor.methods({
  'projects.insert'(name) {
    check(name, String);

    // Make sure the user is logged in before inserting a task
    // if (!Meteor.userId()) {
    //   throw new Meteor.Error('not-authorized');
    // }

    Projects.insert({
      name,
      createdAt: new Date(),
    });
  },

  'projects.remove'(projectId) {
    check(projectId, String);

    Projects.remove(projectId);
  },
});