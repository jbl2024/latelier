
import { Tasks } from "/imports/api/tasks/tasks";
import { Organizations } from "/imports/api/organizations/organizations";

export const findProjectMembersIds = (project) => {
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
  return [...new Set(members)];
};
