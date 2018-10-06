import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Resources = new Mongo.Collection('resources');

Meteor.methods({
  'resource.create'(organizationId, name, description, amount) {
    check(organizationId, String);
    check(name, String);
    check(description, String);
    check(amount, Number);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    const resourceId = Resources.insert({
      organizationId: organizationId,
      name: name,
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      description: description,
      amount: amout
    });

    return resourceId;
  },

  'resources.remove'(resourceId) {
    check(resourceId, String);

    Resources.remove(resourceId);
  },

  'resources.updateName'(id, name) {
    check(id, String);
    check(name, String);
    if (name.length == 0) {
      throw new Meteor.Error('invalid-name');
    }

    Resources.update({ _id: id }, { $set: { name: name } });
  },

  'resources.updateDescription'(id, description) {
    check(id, String);
    check(description, String);
    if (description.length == 0) {
      throw new Meteor.Error('invalid-description');
    }

    Resources.update({ _id: id }, { $set: { description: description } });
  },

  'resources.updateAmount'(id, amount) {
    check(id, String);
    check(amount, Number);

    Resources.update({ _id: id }, { $set: { amount: amount } });
  },
});