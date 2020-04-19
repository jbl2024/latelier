import assert from "assert";
import { expect } from "chai";

import { initData } from "/test/fixtures/fixtures";
import { UserUtils } from "/imports/api/users/utils";

if (Meteor.isServer) {
  describe("users", function() {
    beforeEach(function() {
      initData();
    });

    it("fake users are created", async function() {
      assert.strictEqual(Meteor.users.find().count(), 10);
    });

    it("getByEmail is working", async function() {
      const user = {};

      expect(UserUtils.getEmail(user)).to.be.null;

      user.emails = [{
        address: "foo@bar.com",
        verified: false
      }];
      expect(UserUtils.getEmail(user)).to.be.equal("foo@bar.com");

      user.emails = undefined;

      user.profile = {
        email: "baz@bar.com"
      };
      expect(UserUtils.getEmail(user)).to.be.equal("baz@bar.com");

      user.emails = [{
        address: "foo@bar.com",
        verified: false
      }];
      expect(UserUtils.getEmail(user)).to.be.equal("foo@bar.com");
    });
  });
}
