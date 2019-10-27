import { Tasks } from "/imports/api/tasks/tasks.js";

function fixTaskNumber() {
  const tasks = Tasks.find({
    number: {
      $exists: false
    }
  });
  const count = tasks.count();
  /* eslint no-console: off */
  console.log(`${count} tasks without number`);
  tasks.forEach((task) => {
    Meteor.call("tasks.setNumber", task._id);
  });
}

fixTaskNumber();
