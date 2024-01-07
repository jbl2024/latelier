import { Tasks } from "/imports/api/tasks/tasks";

const addNotification = async function(to, task, type, byId) {
  await Meteor.callAsync("notifications.create", {
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
const getUser = async function(userId, event) {
  const user = await Meteor.users.findOneAsync({ _id: userId });
  if (!user) return null;
  if (user._id === event.userId) return null;
  return user;
};

export const callbacks = {
  async "tasks.assignTo"(event) {
    const { task } = event.properties;
    const user = await getUser(task.assignedTo, event, "tasks.assignTo");
    if (!user) return;

    await addNotification(user, task, "tasks.assignTo", event.userId);
  },

  "*"(event) {
    if (event.type === "tasks.assignTo") return;
    const { task } = event.properties;
    const userIds = Tasks.helpers.findUserIdsInvolvedInTask(task);

    userIds.forEach(async (userId) => {
      const user = await getUser(userId, event, "tasks.update");
      if (!user) return;
      await addNotification(user, task, event.type, event.userId);
    });
  }
};
