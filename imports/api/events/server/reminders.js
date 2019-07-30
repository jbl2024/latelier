import { Jobs } from "meteor/msavin:sjobs";
import moment from "moment";

/**
 * Return user ids involved in task as array
 * 
 * @param {*} task 
 */
const findUserIdsInvolvedInTask = function (task) {
  let userIds = [task.assignedTo, task.createdBy, task.updatedBy];
  task.notes.map(note => {
    userIds.push(note.createdBy);
    userIds.push(note.editedBy);
  });
  userIds = [...new Set(userIds)]; // remove duplicates
  return userIds;
}

Jobs.register({
  sendReminderDueDate: function(userId, taskId) {
    // const users = findUserIdsInvolvedInTask(task);
    console.log('it works')
    this.success();
  },
  sendReminderStartDate: function(userId, taskId) {
    // const users = findUserIdsInvolvedInTask(task);
    console.log('it works')
    this.success();
  }
});



export const callbacks = {
  "tasks.setDueDate"(event) {
    const task = event.properties.task;
    const taskId = task._id;
    const existingJobs = Jobs.collection.find({
      name: "sendReminderDueDate",
      arguments: taskId
    })
    existingJobs.map(job => {
      Jobs.remove(job._id);
    })

    if (!task.reminderDueDate || task.reminderDueDate === "never" || !task.dueDate) {
      return;
    }

    const offset = task.reminderDueDate;
    if (task.reminderDueDate === 'ondate') {
      offset = 0;
    }
    const when = moment(task.dueDate).subtract(offset, 'minutes');

    Jobs.run("sendReminderDueDate", taskId, {
      date: when.toDate(),
    });
  },

  "tasks.setStartDate"(event) {
    const task = event.properties.task;
    const taskId = task._id;
    const existingJobs = Jobs.collection.find({
      name: "sendReminderStartDate",
      arguments: taskId
    })
    existingJobs.map(job => {
      Jobs.remove(job._id);
    })

    if (!task.reminderStartDate || task.reminderStartDate === "never" || !task.startDate) {
      return;
    }

    const offset = task.reminderStartDate;
    if (task.reminderStartDate === 'ondate') {
      offset = 0;
    }
    const when = moment(task.startDate).subtract(offset, 'minutes');

    Jobs.run("sendReminderStartDate", taskId, {
      date: when.toDate(),
    });
  }
};
