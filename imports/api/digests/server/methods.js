import { Digests } from "/imports/api/digests/digests";
import moment from "moment";

const methods = {};

methods.addDigest = new ValidatedMethod({
  name: "digests.add",
  validate: new SimpleSchema({
    type: { type: String },
    properties: { type: Object, blackbox: true }
  }).validator(),
  async run({ type, properties }) {
    try {
      await Meteor.callAsync("digests.run", { type, properties });

      const today = moment().startOf("day").toDate();

      let digestType = type;
      const notUpdateTypes = [
        "tasks.create",
        "tasks.remove",
        "tasks.deleteForever",
        "tasks.complete",
        "tasks.uncomplete"
      ];

      if (digestType === "tasks.complete") {
        await Digests.removeAsync({
          type: "tasks.uncomplete",
          when: today,
          taskId: properties.task._id
        });
      }

      if (digestType === "tasks.uncomplete") {
        await Digests.removeAsync({
          type: "tasks.complete",
          when: today,
          taskId: properties.task._id
        });
      }

      if (!notUpdateTypes.includes(digestType)) {
        digestType = "tasks.update";
      }

      await Digests.upsertAsync(
        {
          type: digestType,
          when: today,
          taskId: properties.task._id
        },
        {
          $set: {
            type: digestType,
            when: today,
            projectId: properties.task.projectId,
            taskId: properties.task._id,
            properties: properties
          }
        }
      );

      await Meteor.callAsync("digests.purge", {
        projectId: properties.task.projectId
      });
    } catch (error) {
      this.$notifyError("Failed to run digest");
    }
  }
});

/**
 * Cap the number of days available in digest
 */
methods.purge = new ValidatedMethod({
  name: "digests.purge",
  validate: new SimpleSchema({
    projectId: { type: String }
  }).validator(),
  run({ projectId }) {
    Meteor.defer(() => {
      const keep = Meteor.settings.digestsRetention || 60;
      const digests = Digests.find(
        {
          projectId: projectId
        },
        {
          sort: {
            when: -1
          }
        }
      ).fetch();

      let when;
      let differentDays = 0;
      const count = digests.length;
      const toDelete = [];
      for (let i = 0; i < count; i++) {
        const digest = digests[i];
        if (digest.when.getTime() !== when) {
          when = digest.when.getTime();
          differentDays += 1;
        }
        if (differentDays > keep) {
          toDelete.push(digest._id);
        }
      }

      if (toDelete.length > 0) {
        Digests.remove({
          _id: { $in: toDelete }
        });
      }
    });
  }
});

export default methods;
