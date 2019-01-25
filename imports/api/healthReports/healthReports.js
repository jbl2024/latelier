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
  'healthReports.create'(projectId, startDate, endDate) {
    check(projectId, String);
    check(startDate, String);
    check(endDate, String);

    

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    const reportId = HealthReports.insert({
      projectId: projectId,
      startDate: moment(startDate, "YYYY-MM-DD").toDate(),
      endDate: moment(endDate, "YYYY-MM-DD").toDate(),
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    return reportId;
  },

  'healthReports.remove'(id) {
    check(id, String);

    HealthReports.remove(id);
  },

  'healthReports.updateStartDate'(id, startDate) {
    check(id, String);
    check(startDate, Date);
    HealthReports.update({_id: id}, {$set: {startDate: startDate}});
  },

  'healthReports.updateEndDate'(id, endDate) {
    check(id, String);
    check(endDate, Date);
    HealthReports.update({_id: id}, {$set: {endDate: endDate}});
  },
});