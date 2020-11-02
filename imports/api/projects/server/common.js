
import { Tasks } from "/imports/api/tasks/tasks";
import { Organizations } from "/imports/api/organizations/organizations";
import JSZip from "jszip";

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

export const createProjectExportZip = ({
  projectId,
  users,
  tasksLists
}) => {
  const zip = new JSZip();
  const projectFolder = zip.folder(projectId);
  projectFolder.file("users.json", JSON.stringify(users));
  if (Array.isArray(tasksLists) && tasksLists.length > 0) {
    const tasksListsFolder = projectFolder.folder("tasks");
    tasksLists.forEach((list) => {
      tasksListsFolder.file(`${list._id}.json`, JSON.stringify(list));
    });
  }
  return zip;
}
