import { Jobs } from "meteor/msavin:sjobs";
import moment from "moment";
import { NotificationTypes } from "/imports/api/notifications/notifications.js";
import { Tasks } from "/imports/api/tasks/tasks.js";

const clearJobs = function(jobName, taskId) {
  const existingJobs = Jobs.collection.find({
    name: jobName,
    arguments: taskId
  });
  existingJobs.forEach((job) => {
    Jobs.remove(job._id);
  });
};

Jobs.register({
  sendReminderDueDate(taskId) {
    const task = Tasks.findOne({ _id: taskId });
    if (!task) {
      this.remove();
      return;
    }

    const userIds = Tasks.helpers.findUserIdsInvolvedInTask(task);

    userIds.forEach((userId) => {
      if (!userId) return;
      Meteor.call("notifications.create", {
        userId,
        type: NotificationTypes.TASK_REMINDER_DUE_DATE,
        properties: {
          task
        }
      });
    });

    this.remove();
  },

  sendReminderStartDate(taskId) {
    const task = Tasks.findOne({ _id: taskId });
    if (!task) {
      this.remove();
      return;
    }

    const userIds = Tasks.helpers.findUserIdsInvolvedInTask(task);

    userIds.forEach((userId) => {
      if (!userId) return;
      Meteor.call("notifications.create", {
        userId,
        type: NotificationTypes.TASK_REMINDER_START_DATE,
        properties: {
          task
        }
      });
    });

    this.remove();
  }
});

export const callbacks = {
  "tasks.setDueDate"(event) {
    const { task } = event.properties;
    const taskId = task._id;
    clearJobs("sendReminderDueDate", taskId);

    if (
      task.completed
      || task.reminderDueDate == null
      || task.reminderDueDate === "never"
      || !task.dueDate
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
    const { task } = event.properties;
    const taskId = task._id;
    clearJobs("sendReminderStartDate", taskId);
    if (
      task.completed
      || task.reminderStartDate == null
      || task.reminderStartDate === "never"
      || !task.startDate
    ) {
      return;
    }

    const offset = parseInt(task.reminderStartDate, 10);
    const when = moment(task.startDate).subtract(offset, "minutes");

    Jobs.run("sendReminderStartDate", taskId, {
      date: when.toDate()
    });
  },

  "tasks.remove"(event) {
    const { task } = event.properties;
    const taskId = task._id;
    clearJobs("sendReminderDueDate", taskId);
    clearJobs("sendReminderStartDate", taskId);
  },

  "tasks.complete"(event) {
    const { task } = event.properties;
    const taskId = task._id;
    clearJobs("sendReminderDueDate", taskId);
    clearJobs("sendReminderStartDate", taskId);
  },

  "tasks.uncomplete"(event) {
    const { task } = event.properties;
    if (task.dueDate) {
      callbacks["tasks.setDueDate"](event);
    }
    if (task.startDate) {
      callbacks["tasks.setStartDate"](event);
    }
  },

  "tasks.restore"(event) {
    const { task } = event.properties;
    if (task.dueDate) {
      callbacks["tasks.setDueDate"](event);
    }
    if (task.startDate) {
      callbacks["tasks.setStartDate"](event);
    }
  }
};
