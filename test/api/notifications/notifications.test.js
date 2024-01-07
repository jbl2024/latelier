import { expect } from "chai";

import { initData } from "/test/fixtures/fixtures";
import { Notifications } from "/imports/api/notifications/notifications";
import { createStubs, restoreStubs } from "/test/stubs";

if (Meteor.isServer) {
  describe("notifications", function() {
    beforeEach(async function() {
      await initData();
      createStubs();
    });

    afterEach(function() {
      restoreStubs();
    });

    it("notifications per user are capped", async function() {
      const userId = (await Meteor.users.findOneAsync())._id;
      const context = { userId };

      for (let i = 0; i < 100; i++) {
        // eslint-disable-next-line no-await-in-loop
        await Notifications.methods.create._execute(context, {
          userId: "user1",
          type: "bar",
          properties: { baz: `number${i}` }
        });
        // eslint-disable-next-line no-await-in-loop
        await Notifications.methods.create._execute(context, {
          userId: "user2",
          type: "bar",
          properties: { baz: `number${i}` }
        });

        // eslint-disable-next-line no-await-in-loop
        await Notifications.methods.create._execute(context, {
          userId: "user3",
          type: "bar",
          properties: { baz: `number${i}` }
        });
      }
      const total = await Notifications.find({}).countAsync();
      expect(total).to.equal(50 * 3);
      expect(await Notifications.find({ userId: "user1" }).countAsync()).to.equal(50);
      expect(await Notifications.find({ userId: "user2" }).countAsync()).to.equal(50);
      expect(await Notifications.find({ userId: "user3" }).countAsync()).to.equal(50);
    });
  });
}
