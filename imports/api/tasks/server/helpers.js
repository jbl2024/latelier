import { Projects } from "/imports/api/projects/projects";
import { Labels } from "/imports/api/labels/labels";
import { Tasks } from "/imports/api/tasks/tasks";

Tasks.helpers.findUserIdsInvolvedInTask = function(task) {
  let userIds = [];
  if (task.assignedTo) userIds.push(task.assignedTo);
  if (task.watchers && task.watchers.length > 0) {
    task.watchers.forEach((watcher) => {
      userIds.push(watcher);
    });
  }
  userIds = [...new Set(userIds)]; // remove duplicates
  return userIds;
};

Tasks.helpers.loadAssociations = async function (task) {
  const loadUser = async (aUserId) => {
    if (!aUserId) return {};
    return Meteor.users.findOneAsync(
      { _id: aUserId },
      {
        fields: {
          profile: 1,
          status: 1,
          statusDefault: 1,
          statusConnection: 1,
          emails: 1,
          roles: 1
        }
      }
    );
  };
  task.project = await Projects.findOneAsync({ _id: task.projectId });
  task.assignedTo = await loadUser(task.assignedTo);
  task.completedBy = await loadUser(task.completedBy);
  if (task.watchers) {
    task.watchers = task.watchers.map(async (watcher) => loadUser(watcher));
  }

  if (task.checklist) {
    task.checklist = task.checklist.map(async (checklistItem) => {
      checklistItem.createdBy = await loadUser(checklistItem.createdBy);
      return checklistItem;
    });
  }

  if (task.notes) {
    task.notes = task.notes.map(async (note) => {
      note.createdBy = await loadUser(note.createdBy);
      return note;
    });
  }

  if (task.labels) {
    task.labels = task.labels.map(async (label) => Labels.findOneAsync({ _id: label }));
  }

  return task;
};
