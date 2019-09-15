import { Tasks } from "/imports/api/tasks/tasks";

const addNotification = function(to, task, type, byId) {
  Meteor.call("notifications.create", {
    userId: to._id,
    type: type,
    properties: { task: task, user: Meteor.users.findOne({ _id: byId }) }
  });
};

/**
 * Return user for event
 *
 * If userId is the same as event.userId, it is ignored (no self notifications)
 *
 * @param {} userId
 * @param {*} event
 * @param {*} settings email notification settings
 */
const getUser = function(userId, event, settings) {
  const user = Meteor.users.findOne({ _id: userId });
  if (!user) return;
  if (user._id === event.userId) return;
  return user;
};

export const callbacks = {
  "tasks.assignTo"(event) {
    const task = event.properties.task;
    const user = getUser(task.assignedTo, event, "tasks.assignTo");
    if (!user) return;

    addNotification(user, task, "tasks.assignTo", event.userId);
  },

  "*"(event) {
    if (event.type === "tasks.assignTo") return;
    const task = event.properties.task;
    const userIds = Tasks.helpers.findUserIdsInvolvedInTask(task);

    userIds.map(userId => {
      const user = getUser(userId, event, "tasks.update");
      if (!user) return;
      addNotification(user, task, event.type, event.userId);
    });
  }
};
