import { expect } from 'chai';

import { initData } from "/test/fixtures/fixtures";
import { Notifications } from "/imports/api/notifications/notifications";
import { createStubs, restoreStubs } from "/test/stubs"

if (Meteor.isServer) {
  
  describe("notifications", function() {
    beforeEach(function() {
      initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("notifications per user are capped", async function() {
      const userId = Meteor.users.findOne()._id;
      const context = {userId: userId};

      for (let i = 0; i < 100; i++) {
        Notifications.methods.create._execute(context, {
          userId: "user1",
          type: "bar",
          properties: { baz: 'number' + i}
        });
        Notifications.methods.create._execute(context, {
          userId: "user2",
          type: "bar",
          properties: { baz: 'number' + i}
        });

        Notifications.methods.create._execute(context, {
          userId: "user3",
          type: "bar",
          properties: { baz: 'number' + i}
        });
      }
      const total = Notifications.find({}).count();
      expect(total).to.equal(50 * 3);
      expect(Notifications.find({userId: "user1"}).count()).to.equal(50);
      expect(Notifications.find({userId: "user2"}).count()).to.equal(50);
      expect(Notifications.find({userId: "user3"}).count()).to.equal(50);
    });
  });
}