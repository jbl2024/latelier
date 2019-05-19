import assert from "assert";
import { initData } from "/test/fixtures/fixtures";
import { Features } from "/imports/api/features/features";

if (Meteor.isServer) {
  describe("features", function() {
    beforeEach(function() {
      initData();
    });

    it("enable should be an upsert", async function() {
      assert.strictEqual(Features.find().count(), 0);

      Meteor.call("features.enable", {
        name: "estimation",
        objectId: "foo"
      });
      assert.strictEqual(Features.find().count(), 1);

      Meteor.call("features.enable", {
        name: "estimation",
        objectId: "foo"
      });
      assert.strictEqual(Features.find().count(), 1);

      Meteor.call("features.enable", {
        name: "estimation",
        objectId: "bar"
      });
      assert.strictEqual(Features.find().count(), 2);

      Meteor.call("features.enable", {
        name: "vote",
        objectId: "foo"
      });
      assert.strictEqual(Features.find().count(), 3);
    });

    it("disable should be an upsert", async function() {
      assert.strictEqual(Features.find().count(), 0);

      Meteor.call("features.enable", {
        name: "estimation",
        objectId: "foo"
      });
      assert.strictEqual(Features.find().count(), 1);

      Meteor.call("features.disable", {
        name: "estimation",
        objectId: "foo"
      });
      assert.strictEqual(Features.find().count(), 1);

      Meteor.call("features.disable", {
        name: "estimation",
        objectId: "bar"
      });
      assert.strictEqual(Features.find().count(), 2);

      Meteor.call("features.disable", {
        name: "vote",
        objectId: "foo"
      });
      assert.strictEqual(Features.find().count(), 3);
    });

    it("enable and disable should work", async function() {
      assert.strictEqual(Features.find().count(), 0);

      Meteor.call("features.enable", {
        name: "estimation",
        objectId: "foo"
      });
      assert.strictEqual(Features.findOne().enabled, true);

      assert.strictEqual(
        Meteor.call("features.isEnabled", {
          name: "estimation",
          objectId: "foo"
        }),
        true
      );

      Meteor.call("features.disable", {
        name: "estimation",
        objectId: "foo"
      });
      assert.strictEqual(Features.findOne().enabled, false);
      assert.strictEqual(
        Meteor.call("features.isEnabled", {
          name: "estimation",
          objectId: "foo"
        }),
        false
      );
    });

    it("load feature should return feature names", async function() {
      Meteor.call("features.enable", {
        name: "estimation",
        objectId: "foo"
      });
      assert.strictEqual(
        Meteor.call("features.load", {
          objectId: "foo"
        })[0],
        "estimation"
      );

      Meteor.call("features.disable", {
        name: "estimation",
        objectId: "foo"
      });
      assert.strictEqual(Features.findOne().enabled, false);
      assert.strictEqual(
        Meteor.call("features.load", {
          objectId: "foo"
        }).length,
        0
      );
    });

  });
}
