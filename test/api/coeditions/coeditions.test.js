import { expect } from "chai";

import { initData } from "/test/fixtures/fixtures";
import { Coeditions } from "/imports/api/coeditions/coeditions";
import { createStubs, restoreStubs } from "/test/stubs";

if (Meteor.isServer) {
  describe("notifications", function () {
    beforeEach(function () {
      initData();
      createStubs();
    });

    afterEach(function () {
      restoreStubs();
    });

    it("coeditions per objectId are capped", async function () {
      for (let i = 0; i < 1000; i++) {
        Coeditions.insert({
          objectId: "object-a",
          version: i
        });
        Coeditions.insert({
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

      Meteor.call("coeditions.purge", { objectId: "object-a" });

      // after purge:
      // 999
      // 998
      // 997
      // ...
      // 501
      // 500

      expect(Coeditions.find({ objectId: "object-a" }).count()).to.equal(500);
      expect(Coeditions.find({ objectId: "object-b" }).count()).to.equal(1000);

      let coeds = Coeditions.find({ objectId: "object-a" }, { sort: { version: -1 }, limit: 2 }).fetch();
      expect(coeds[0].version).equal(999);
      expect(coeds[1].version).equal(998);

      coeds = Coeditions.find({ objectId: "object-a" }, { sort: { version: 1 }, limit: 2 }).fetch();
      expect(coeds[0].version).equal(500);
      expect(coeds[1].version).equal(501);
    });
  });
}
