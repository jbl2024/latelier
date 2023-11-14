import { Jobs } from "meteor/msavin:sjobs";
import moment from "moment";
import { NotificationTypes } from "/imports/api/notifications/notifications.js";
import { Tasks } from "/imports/api/tasks/tasks.js";

const clearJobs = async function(jobName, taskId) {
  const existingJobs = Jobs.collection.find({
    name: jobName,
    arguments: taskId
  });
  await existingJobs.forEachAsync(async (job) => {
    await Jobs.remove(job._id);
  });
};

Jobs.register({
  async sendReminderDueDate(taskId) {
    const task = await Tasks.findOneAsync({ _id: taskId });
    if (!task) {
      this.remove();
      return;
    }

    const userIds = Tasks.helpers.findUserIdsInvolvedInTask(task);

    userIds.forEach(async (userId) => {
      if (!userId) return;
      await Meteor.callAsync("notifications.create", {
        userId,
        type: NotificationTypes.TASK_REMINDER_DUE_DATE,
        properties: {
          task
        }
      });
    });

    await this.remove();
  },

  async sendReminderStartDate(taskId) {
    const task = await Tasks.findOneAsync({ _id: taskId });
    if (!task) {
      this.remove();
      return;
    }

    const userIds = Tasks.helpers.findUserIdsInvolvedInTask(task);

    userIds.forEach(async (userId) => {
      if (!userId) return;
      await Meteor.callAsync("notifications.create", {
        userId,
        type: NotificationTypes.TASK_REMINDER_START_DATE,
        properties: {
          task
        }
      });
    });

    await this.removeAsync();
  }
});

export const callbacks = {
  async "tasks.setDueDate"(event) {
    const { task } = event.properties;
    const taskId = task._id;
    await clearJobs("sendReminderDueDate", taskId);

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

  async "tasks.setStartDate"(event) {
    const { task } = event.properties;
    const taskId = task._id;
    await clearJobs("sendReminderStartDate", taskId);
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

  async "tasks.remove"(event) {
    const { task } = event.properties;
    const taskId = task._id;
    await clearJobs("sendReminderDueDate", taskId);
    await clearJobs("sendReminderStartDate", taskId);
  },

  async "tasks.complete"(event) {
    const { task } = event.properties;
    const taskId = task._id;
    await clearJobs("sendReminderDueDate", taskId);
    await clearJobs("sendReminderStartDate", taskId);
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
