import assert from "assert";
import { initData } from "/test/fixtures/fixtures";

if (Meteor.isServer) {
  describe("users", function() {
    beforeEach(function() {
      initData();
    });

    it("fake users are created", async function() {
      assert.strictEqual(Meteor.users.find().count(), 10);
    });
  });
}
