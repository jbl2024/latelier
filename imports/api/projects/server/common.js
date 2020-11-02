
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
  project,
  users,
  tasksLists,
  bpmnDiagrams,
  meetings,
  canvases,
  healthReports
}) => {
  const zip = new JSZip();
  const projectFolder = zip.folder(project._id);

  // Project
  projectFolder.file("project.json", JSON.stringify(project));

  // Users
  projectFolder.file("users.json", JSON.stringify(users));

  // Tasks
  if (Array.isArray(tasksLists) && tasksLists.length > 0) {
    const tasksListsFolder = projectFolder.folder("tasks");
    tasksLists.forEach((list) => {
      tasksListsFolder.file(`${list._id}.json`, JSON.stringify(list));
    });
  }

  // BPMN Diagrams
  if (Array.isArray(bpmnDiagrams) && bpmnDiagrams.length > 0) {
    const bpmnFolder = projectFolder.folder("bpmn");
    bpmnDiagrams.forEach((diagram) => {
      bpmnFolder.file(`${diagram._id}.json`, JSON.stringify(diagram));
    });
  }

  // Meetings
  if (Array.isArray(meetings) && meetings.length > 0) {
    const meetingsFolder = projectFolder.folder("meetings");
    meetings.forEach((meeting) => {
      meetingsFolder.file(`${meeting._id}.json`, JSON.stringify(meeting));
    });
  }

  // Canvases
  if (Array.isArray(canvases) && canvases.length > 0) {
    const canvasesFolder = projectFolder.folder("canvas");
    canvases.forEach((canvas) => {
      canvasesFolder.file(`${canvas._id}.json`, JSON.stringify(canvas));
    });
  }

  // healthReports
  if (Array.isArray(healthReports) && healthReports.length > 0) {
    const weatherFolder = projectFolder.folder("weather");
    healthReports.forEach((healthReport) => {
      weatherFolder.file(`${healthReport._id}.json`, JSON.stringify(healthReport));
    });
  }

  return zip;
}
