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

const clearJobs = function (jobName, taskId)  {
  const existingJobs = Jobs.collection.find({
    name: jobName,
    arguments: taskId
  })
  existingJobs.map(job => {
    Jobs.remove(job._id);
  })
}

Jobs.register({
  sendReminderDueDate: function(taskId) {
    console.log('#############################################')
    // Jobs.clear("success", "sendReminderDueDate", taskId);
    // const users = findUserIdsInvolvedInTask(task);
    this.success();
    clearJobs("sendReminderDueDate", taskId);
  },
  sendReminderStartDate: function(taskId) {
    console.log('#############################################')
    // Jobs.clear("success", "sendReminderStartDate", taskId);
    // const users = findUserIdsInvolvedInTask(task);
    console.log('it works')
    this.success();
    clearJobs("sendReminderStartDate", taskId);
  }
});



export const callbacks = {
  "tasks.setDueDate"(event) {
    const task = event.properties.task;
    const taskId = task._id;
    clearJobs("sendReminderDueDate", taskId);

    if (!task.reminderDueDate || task.reminderDueDate === "never" || !task.dueDate) {
      return;
    }

    const offset = parseInt(task.reminderDueDate, 10);
    const when = moment(task.dueDate).subtract(offset, 'minutes');

    Jobs.run("sendReminderDueDate", taskId, {
      date: when.toDate(),
    });
  },

  "tasks.setStartDate"(event) {
    const task = event.properties.task;
    const taskId = task._id;
    clearJobs("sendReminderStartDate", taskId);
    if (!task.reminderStartDate || task.reminderStartDate === "never" || !task.startDate) {
      return;
    }

    const offset = parseInt(task.reminderStartDate, 10);
    const when = moment(task.startDate).subtract(offset, 'minutes');

    Jobs.run("sendReminderStartDate", taskId, {
      date: when.toDate(),
    });
  }
};
