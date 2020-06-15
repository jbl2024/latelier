
import { Tasks } from "/imports/api/tasks/tasks";
import { Organizations } from "/imports/api/organizations/organizations";

export const findProjectUsers = (project) => {
  const members = Array.from(project.members || []);
  const tasks = Tasks.find(
    { projectId: project._id, deleted: { $ne: true } },
    { fields: { createdBy: 1, updatedBy: 1 } }
  );
  tasks.forEach((task) => {
    if (task.createdBy) members.push(task.createdBy);
    if (task.updatedBy) members.push(task.updatedBy);
    if (task.watchers) {
      members.push(task.watchers.map((watcher) => watcher));
    }
  });

  if (project.organizationId) {
    const organization = Organizations.findOne(
      { _id: project.organizationId },
      { fields: { members: 1 } }
    );
    if (organization) {
      organization.members.forEach((member) => {
        members.push(member);
      });
    }
  }

  return Meteor.users.find(
    { _id: { $in: [...new Set(members)] } },
    {
      fields: {
        profile: 1,
        status: 1,
        statusDefault: 1,
        statusConnection: 1,
        emails: 1
      }
    }
  );
};
