// This file will be auto-imported in the app-test context,
// ensuring the method is always available

import { Meteor } from "meteor/meteor";
import { sinon } from "meteor/practicalmeteor:sinon";

function stubUser(currentUserId) {
  if (!currentUserId) {
    currentUserId = Meteor.users.findOne()._id;
  }
  if (!Meteor.userId()) {
    // dont stub twice just in case
    sinon.stub(Meteor, "userId", () => currentUserId);
    sinon.stub(Meteor, "user", () => Meteor.users.findOne({ _id: currentUserId }));
  }
}

function restoreUser() {
  // to avoid unrecognized bugs ensure the method is stubbed by checking for restore method
  if (Meteor.userId.restore) Meteor.userId.restore();
  if (Meteor.user.restore) Meteor.user.restore();
}
// Remember to double check this is a test-only file before
// adding a method like this!
Meteor.methods({
  /* eslint meteor/audit-argument-checks: off */
  stub(currentUser) {
    stubUser(currentUser);
  },
  restore() {
    restoreUser();
  }
});

// eslint-disable-next-line import/no-mutable-exports
let createStubs;
// eslint-disable-next-line import/no-mutable-exports
let restoreStubs;

if (Meteor.isClient) {
  // Create a second connection to the server to use to call
  // test data methods. We do this so there's no contention
  // with the currently tested user's connection.
  const testConnection = Meteor.connect(Meteor.absoluteUrl());

  createStubs = async (currentUser, cb) => {
    // hey, we have to stub current user both on client and server
    stubUser(currentUser); // stub on client
    await testConnection.call("stub", currentUser, cb); // stub on server
  };
  restoreStubs = async (cb) => {
    restoreUser();
    await testConnection.call("restore", cb);
  };
} else {
  // used in server side tests
  createStubs = (currentUser) => Meteor.call("stub", currentUser);
  restoreStubs = () => Meteor.call("restore");
}

export { createStubs, restoreStubs };
