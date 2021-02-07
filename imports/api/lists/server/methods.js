import { Tasks } from "/imports/api/tasks/tasks";
import { Lists } from "/imports/api/lists/lists";

Lists.methods.recalculateTaskCount = new ValidatedMethod({
  name: "lists.recalculateTaskCount",
  validate: new SimpleSchema({
    listId: { type: String }
  }).validator(),
  run({ listId }) {
    this.unblock();
    Meteor.defer(() => {
      const lists = Lists.find({
        _id: listId
      });
      lists.forEach((list) => {
        const taskCount = Tasks.find({
          listId: list._id,
          deleted: { $ne: true }
        }).count();
        const taskCompletedCount = Tasks.find({
          listId: list._id,
          completed: true,
          deleted: { $ne: true }
        }).count();
        Lists.update({
          _id: list._id
        }, {
          $set: {
            taskCount,
            taskCompletedCount
          }
        });
      });
    });
  }
});
