import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import moment from "moment";

export const HealthReports = new Mongo.Collection('healthReports');
if (Meteor.isServer) {
  Meteor.startup(() => {
    HealthReports.rawCollection().createIndex({projectId: 1});
  });
}

Meteor.methods({
  'healthReports.create'(projectId, name, description, date) {
    check(projectId, String);
    check(name, String);
    check(description, String);
    check(date, String);

    const convertedDate = moment(date, "YYYY-MM-DD").toDate();

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    const reportId = HealthReports.insert({
      projectId: projectId,
      name: name,
      description: description,
      date: convertedDate,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    return reportId;
  },

  'healthReports.remove'(id) {
    check(id, String);

    HealthReports.remove(id);
  },

  'healthReports.updateDate'(id, date) {
    check(id, String);
    check(date, String);
    const convertedDate = moment(date, "YYYY-MM-DD").toDate();

    HealthReports.update({_id: id}, {$set: {date: convertedDate}});
  },

  'healthReports.updateDescription'(id, description) {
    check(id, String);
    check(description, String);
    HealthReports.update({_id: id}, {$set: {description: description}});
  },

  'healthReports.updateName'(id, name) {
    check(id, String);
    check(name, String);
    HealthReports.update({_id: id}, {$set: {name: name}});
  },

});