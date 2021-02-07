import { Lists } from "/imports/api/lists/lists";
import { Tasks } from "/imports/api/tasks/tasks";

function fixTaskCountInList() {
  const lists = Lists.find({
    taskCount: { $exists: false }
  });
  const listCount = lists.count();
  if (listCount === 0) {
    return;
  }

  /* eslint no-console: off */
  console.log(`Calculating task count for ${listCount} lists`);

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

  /* eslint no-console: off */
  console.log(`Calculating task count for ${listCount} lists: done`);
}

fixTaskCountInList();
