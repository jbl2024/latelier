import assert from "assert";
import "/server/main"
import "/test/api/users/users.test"
import "/test/api/bpmn/processDiagrams.test"
import "/test/api/projects/projects.test"
import "/test/api/labels/labels.test"

describe("latelier", function () {
  it("package.json has correct name", async function () {
    const { name } = await import("../package.json");
    assert.strictEqual(name, "latelier");
  });

  if (Meteor.isClient) {
    it("client is not server", function () {
      assert.strictEqual(Meteor.isServer, false);
    });
  }

  if (Meteor.isServer) {
    it("server is not client", function () {
      assert.strictEqual(Meteor.isClient, false);
    });
  }
});
