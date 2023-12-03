import { Tasks } from "/imports/api/tasks/tasks.js";

async function fixTaskNumber() {
  const tasks = Tasks.find({
    number: {
      $exists: false
    }
  });
  const count = await tasks.countAsync();
  /* eslint no-console: off */
  console.log(`${count} tasks without number`);
  tasks.forEachAsync(async (task) => {
    await Meteor.callAsync("tasks.setNumber", task._id);
  });
}

await fixTaskNumber();
