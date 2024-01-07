import { expect } from "chai";

import { initData } from "/test/fixtures/fixtures";
import { Coeditions } from "/imports/api/coeditions/coeditions";
import { createStubs, restoreStubs } from "/test/stubs";

import moment from "moment";

if (Meteor.isServer) {
  describe("notifications", function () {
    beforeEach(async function () {
      await initData();
      createStubs();
    });

    afterEach(function () {
      restoreStubs();
    });

    it("coeditions per objectId are capped", async function () {
      for (let i = 0; i < 1000; i++) {
        // eslint-disable-next-line no-await-in-loop
        await Coeditions.insertAsync({
          createdAt: new Date(),
          objectId: "object-a",
          version: i
        });
        // eslint-disable-next-line no-await-in-loop
        await Coeditions.insertAsync({
          createdAt: new Date(),
          objectId: "object-b",
          version: i
        });
      }

      // before purge:
      // 999
      // 998
      // 997
      // ...
      // 1
      // 0

      await Meteor.callAsync("coeditions.purge", { objectId: "object-a" });

      // after purge:
      // 999
      // 998
      // 997
      // ...
      // 501
      // 500

      expect(await Coeditions.find({ objectId: "object-a" }).countAsync()).to.equal(500);
      expect(await Coeditions.find({ objectId: "object-b" }).countAsync()).to.equal(1000);

      let coeds = await Coeditions.find({ objectId: "object-a" }, { sort: { version: -1 }, limit: 2 }).fetchAsync();
      expect(coeds[0].version).equal(999);
      expect(coeds[1].version).equal(998);

      coeds = await Coeditions.find({ objectId: "object-a" }, { sort: { version: 1 }, limit: 2 }).fetchAsync();
      expect(coeds[0].version).equal(500);
      expect(coeds[1].version).equal(501);
    });

    it("coeditions are removed after delay", async function () {
      for (let i = 0; i < 1000; i++) {
        Coeditions.insert({
          createdAt: moment()
            .startOf("day")
            .add(-5, "days")
            .add(i, "seconds")
            .toDate(),
          objectId: "object-a",
          version: i
        });
        Coeditions.insert({
          createdAt: moment()
            .startOf("day")
            .add(-1, "days")
            .add(i, "seconds")
            .toDate(),
          objectId: "object-b",
          version: i
        });
      }

      expect(await Coeditions.find({ objectId: "object-a" }).countAsync()).to.equal(1000);
      expect(await Coeditions.find({ objectId: "object-b" }).countAsync()).to.equal(1000);

      let deleteDate = moment()
        .startOf("day")
        .add(-10, "days")
        .toDate();
      await Meteor.callAsync("coeditions.removeOutdated", { when: deleteDate });

      expect(await Coeditions.find({ objectId: "object-a" }).countAsync()).to.equal(1000);
      expect(await Coeditions.find({ objectId: "object-b" }).countAsync()).to.equal(1000);

      deleteDate = moment()
        .startOf("day")
        .add(-3, "days")
        .toDate();

      await Meteor.callAsync("coeditions.removeOutdated", { when: deleteDate });

      expect(await Coeditions.find({ objectId: "object-a" }).countAsync()).to.equal(0);
      expect(await Coeditions.find({ objectId: "object-b" }).countAsync()).to.equal(1000);

      deleteDate = moment()
        .startOf("day")
        .add(0, "days")
        .toDate();

      await Meteor.callAsync("coeditions.removeOutdated", { when: deleteDate });

      expect(await Coeditions.find({ objectId: "object-a" }).countAsync()).to.equal(0);
      expect(await Coeditions.find({ objectId: "object-b" }).countAsync()).to.equal(0);
    });
  });
}
