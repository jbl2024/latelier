import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Tasks } from "/imports/api/tasks/tasks";

export const Labels = new Mongo.Collection('labels');
if (Meteor.isServer) {
  Meteor.startup(() => {
    Tasks.rawCollection().createIndex({projectId: 1});
  });
}

Meteor.methods({
  'labels.create'(projectId, name, color) {
    check(projectId, String);
    check(name, String);
    check(color, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    var labelId = Labels.insert({
      projectId: projectId,
      name: name,
      color: color,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    return labelId;
  },

  'labels.remove'(labelId) {
    check(labelId, String);

    // See https://github.com/matb33/meteor-collection-hooks#direct-access-circumventing-hooks
    // Avoid calling hooks to prevent polluting task last modification date
    Tasks.direct.update({labels: labelId}, { $pull: { labels: labelId } }, {multi: true});
    Labels.remove(labelId);
  },

  'labels.updateName'(labelId, name) {
    check(labelId, String);
    check(name, String);
    if (name.length == 0) {
      throw new Meteor.Error('invalid-name');
    }

    Labels.update({_id: labelId}, {$set: {name: name}});
  },

  'labels.updateColor'(labelId, color) {
    check(labelId, String);
    check(color, String);
    if (color.length == 0) {
      throw new Meteor.Error('invalid-color');
    }

    Labels.update({_id: labelId}, {$set: {color: color}});
  },

  'labels.updateNameAndColor'(labelId, name, color) {
    check(labelId, String);
    check(name, String);
    check(color, String);
    if (name.length == 0) {
      throw new Meteor.Error('invalid-name');
    }
    if (color.length == 0) {
      throw new Meteor.Error('invalid-color');
    }

    Labels.update({_id: labelId}, {$set: {color: color, name: name}});
  },

});