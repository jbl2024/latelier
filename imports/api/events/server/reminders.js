import { Jobs } from "meteor/msavin:sjobs";

Jobs.register({
  sendReminder: function(userId, taskId) {

    this.success();
  }
});

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


export const callbacks = {
  "tasks.setDueDate"(event) {
    const task = event.properties.task;
    Jobs.find("sendReminder", userId, taskId, function (jobDoc) {
      if (jobDoc) {
        this.remove();
      }
    });

    if (!task.reminderDueDate || task.reminderDueDate === "never") {
      return;
    }

    const users = findUserIdsInvolvedInTask(task);
    users.map(userId => {
      if (!userId) return;
      Jobs.run("sendReminder", userId, taskId, {
        in: {
            days: 3,
        }, 
        priority: 9999999999
    });      
    })
  }
};
