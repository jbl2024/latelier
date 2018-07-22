import { Meteor } from 'meteor/meteor';
import { Lists } from '../lists';

// This code only runs on the server
Meteor.publish('lists', function listsPublication(projectId) {
  return Lists.find({ projectId: projectId }, {sort: {order: -1}});
});

Meteor.publish('list', function list(listId) {
  return Lists.find({ _id: listId });
});
