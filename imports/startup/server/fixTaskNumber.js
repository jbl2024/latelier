import { Tasks } from "/imports/api/tasks/tasks.js";

function fixTaskNumber() {
  const tasks = Tasks.find({
    number: {
      $exists: false
    }
  });
  const count = tasks.count();
  console.log(`${count} tasks without number`)
  tasks.map(task => {
    Meteor.call("tasks.setNumber", task._id);  
  });
}

fixTaskNumber();