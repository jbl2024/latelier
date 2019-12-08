import assert from "assert";
import "/server/main";
import "/test/api/users/users.test";
import "/test/api/bpmn/processDiagrams.test";
import "/test/api/projects/projects.test";
import "/test/api/tasks/tasks.test";
import "/test/api/organizations/organizations.test";
import "/test/api/labels/labels.test";
import "/test/api/notifications/notifications.test";
import "/test/api/canvas/canvas.test";
import "/test/api/healthReports/healthReports.test";
import "/test/api/dashboards/dashboards.test";
import "/test/api/search/search.test";
import "/test/api/digests/digests.test";

describe("latelier", function() {
  it("package.json has correct name", async function() {
    const { name } = await import("../package.json");
    assert.strictEqual(name, "latelier");
  });

  if (Meteor.isClient) {
    it("client is not server", function() {
      assert.strictEqual(Meteor.isServer, false);
    });
  }

  if (Meteor.isServer) {
    it("server is not client", function() {
      assert.strictEqual(Meteor.isClient, false);
    });
  }
});
