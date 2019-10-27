import { Tasks } from "/imports/api/tasks/tasks";

const addNotification = function(to, task, type, byId) {
  Meteor.call("notifications.create", {
    userId: to._id,
    type,
    properties: { task, user: Meteor.users.findOne({ _id: byId }) }
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
const getUser = function(userId, event) {
  const user = Meteor.users.findOne({ _id: userId });
  if (!user) return null;
  if (user._id === event.userId) return null;
  return user;
};

export const callbacks = {
  "tasks.assignTo"(event) {
    const { task } = event.properties;
    const user = getUser(task.assignedTo, event, "tasks.assignTo");
    if (!user) return;

    addNotification(user, task, "tasks.assignTo", event.userId);
  },

  "*"(event) {
    if (event.type === "tasks.assignTo") return;
    const { task } = event.properties;
    const userIds = Tasks.helpers.findUserIdsInvolvedInTask(task);

    userIds.forEach((userId) => {
      const user = getUser(userId, event, "tasks.update");
      if (!user) return;
      addNotification(user, task, event.type, event.userId);
    });
  }
};
