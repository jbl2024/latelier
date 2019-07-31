import { Jobs } from "meteor/msavin:sjobs";
import moment from "moment";
import { NotificationTypes } from "/imports/api/notifications/notifications.js";
import { Tasks } from "/imports/api/tasks/tasks.js";

const clearJobs = function(jobName, taskId) {
  const existingJobs = Jobs.collection.find({
    name: jobName,
    arguments: taskId
  });
  existingJobs.map(job => {
    Jobs.remove(job._id);
  });
};

Jobs.register({
  sendReminderDueDate: function(taskId) {
    const task = Tasks.findOne({ _id: taskId });
    if (!task) return;

    const userIds = Tasks.helpers.findUserIdsInvolvedInTask(task);

    userIds.map(userId => {
      if (!userId) return;
      Meteor.call("notifications.create", {
        userId: userId,
        type: NotificationTypes.TASK_REMINDER_DUE_DATE,
        properties: {
          taskId: task._id
        }
      });
    });

    this.remove();
  },

  sendReminderStartDate: function(taskId) {
    console.log("#############################################");
    // Jobs.clear("success", "sendReminderStartDate", taskId);
    // const users = findUserIdsInvolvedInTask(task);
    console.log("it works");
    this.remove();
  }
});

export const callbacks = {
  "tasks.setDueDate"(event) {
    const task = event.properties.task;
    const taskId = task._id;
    clearJobs("sendReminderDueDate", taskId);

    if (
      !task.reminderDueDate ||
      task.reminderDueDate === "never" ||
      !task.dueDate
    ) {
      return;
    }

    const offset = parseInt(task.reminderDueDate, 10);
    const when = moment(task.dueDate).subtract(offset, "minutes");

    Jobs.run("sendReminderDueDate", taskId, {
      date: when.toDate()
    });
  },

  "tasks.setStartDate"(event) {
    const task = event.properties.task;
    const taskId = task._id;
    clearJobs("sendReminderStartDate", taskId);
    if (
      !task.reminderStartDate ||
      task.reminderStartDate === "never" ||
      !task.startDate
    ) {
      return;
    }

    const offset = parseInt(task.reminderStartDate, 10);
    const when = moment(task.startDate).subtract(offset, "minutes");

    Jobs.run("sendReminderStartDate", taskId, {
      date: when.toDate()
    });
  }
};
