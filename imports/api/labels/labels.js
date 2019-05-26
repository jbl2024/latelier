import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Tasks } from "/imports/api/tasks/tasks";
import { checkLoggedIn, checkCanReadProject, checkCanWriteProject } from "/imports/api/permissions/permissions"

export const Labels = new Mongo.Collection('labels');
if (Meteor.isServer) {
  Meteor.startup(() => {
    Tasks.rawCollection().createIndex({projectId: 1});
  });
}

Labels.methods = {}

Labels.methods.create = new ValidatedMethod({
  name: "labels.create",
  validate: new SimpleSchema({
    projectId: { type: String },
    name: { type: String },
    color: { type: String },
  }).validator(),
  run({ projectId, name, color}) {
    checkLoggedIn();
    checkCanWriteProject(projectId);

    const labelId = Labels.insert({
      projectId: projectId,
      name: name,
      color: color,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });
    return labelId;   
  }
});


Labels.methods.remove = new ValidatedMethod({
  name: "labels.remove",
  validate: new SimpleSchema({
    labelId: { type: String }
  }).validator(),
  run({ labelId}) {
    checkLoggedIn();
    const label = Labels.findOne({_id: labelId});
    if (!label) {
      throw new Meteor.Error("not-found");      
    }
    checkCanWriteProject(label.projectId);
    Tasks.direct.update({labels: labelId}, { $pull: { labels: labelId } }, {multi: true});
    Labels.remove(labelId);
  }
});


Labels.methods.updateColor = new ValidatedMethod({
  name: "labels.updateColor",
  validate: new SimpleSchema({
    labelId: { type: String },
    color: { type: String }
  }).validator(),
  run({ labelId, color}) {
    checkLoggedIn();
    const label = Labels.findOne({_id: labelId});
    if (!label) {
      throw new Meteor.Error("not-found");      
    }
    checkCanWriteProject(label.projectId);
    Labels.update({_id: labelId}, {$set: {color: color}});
  }
});

Labels.methods.updateNameAndColor = new ValidatedMethod({
  name: "labels.updateNameAndColor",
  validate: new SimpleSchema({
    labelId: { type: String },
    name: { type: String },
    color: { type: String }
  }).validator(),
  run({ labelId, name, color}) {
    checkLoggedIn();
    const label = Labels.findOne({_id: labelId});
    if (!label) {
      throw new Meteor.Error("not-found");      
    }
    checkCanWriteProject(label.projectId);
    Labels.update({_id: labelId}, {$set: {color: color, name: name}});
  }
});

Labels.methods.import = new ValidatedMethod({
  name: "labels.import",
  validate: new SimpleSchema({
    from: { type: String },
    to: { type: String },
  }).validator(),
  run({ from, to}) {
    checkLoggedIn();
    checkCanReadProject(from);
    checkCanWriteProject(to);

    const labels = Labels.find({projectId: from}) || [];
    labels.map(label => {
      if (!Labels.findOne({projectId: to, name: label.name})) {
        Meteor.call("labels.create", {projectId: to, name: label.name, color: label.color});
      }
    })
  }
});
