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

Tasks.helpers.loadAssociations = function (task) {
  const loadUser = (aUserId) => {
    if (!aUserId) return {};
    return Meteor.users.findOne(
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

  task.project = Projects.findOne({ _id: task.projectId });
  task.assignedTo = loadUser(task.assignedTo);
  task.completedBy = loadUser(task.completedBy);
  if (task.watchers) {
    task.watchers = task.watchers.map((watcher) => loadUser(watcher));
  }

  if (task.checklist) {
    task.checklist = task.checklist.map((checklistItem) => {
      checklistItem.createdBy = loadUser(checklistItem.createdBy);
      return checklistItem;
    });
  }

  if (task.notes) {
    task.notes = task.notes.map((note) => {
      note.createdBy = loadUser(note.createdBy);
      return note;
    });
  }

  if (task.labels) {
    task.labels = task.labels.map((label) => Labels.findOne({ _id: label }));
  }

  return task;
};
