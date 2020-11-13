import JSZip from "jszip";
import ZipProject from "/imports/api/projects/importExport/ZipProject";

export const items = [
  "tasks",
  "users",
  "meetings",
  "bpmn",
  "canvas",
  "weather"
];

export const createProjectExportZip = ({
  metadatas,
  project,
  users,
  tasksLists,
  bpmnDiagrams,
  meetings,
  canvas,
  healthReports
}) => {
  const zip = new JSZip();
  const projectFolder = zip.folder(project._id);
  const itemsMetas = { users: { count: Object.keys(users).length } };

  // Users
  projectFolder.file("users.json", JSON.stringify(users));

  // Tasks
  if (Array.isArray(tasksLists) && tasksLists.length > 0) {
    const tasksListsFolder = projectFolder.folder("tasks");
    itemsMetas.tasks = { count: 0 };
    tasksLists.forEach((list) => {
      itemsMetas.tasks.count += list.tasks.length;
      tasksListsFolder.file(`${list._id}.json`, JSON.stringify(list));
    });
  }

  // BPMN Diagrams
  if (Array.isArray(bpmnDiagrams) && bpmnDiagrams.length > 0) {
    const bpmnFolder = projectFolder.folder("bpmn");
    itemsMetas.bpmn = { count: bpmnDiagrams.length };
    bpmnDiagrams.forEach((diagram) => {
      bpmnFolder.file(`${diagram._id}.json`, JSON.stringify(diagram));
    });
  }

  // Meetings
  if (Array.isArray(meetings) && meetings.length > 0) {
    const meetingsFolder = projectFolder.folder("meetings");
    itemsMetas.meetings = { count: meetings.length };
    meetings.forEach((meeting) => {
      meetingsFolder.file(`${meeting._id}.json`, JSON.stringify(meeting));
    });
  }

  // Canvas
  if (canvas && canvas._id) {
    projectFolder.file("canvas.json", JSON.stringify(canvas));
  }

  // healthReports
  if (Array.isArray(healthReports) && healthReports.length > 0) {
    const weatherFolder = projectFolder.folder("weather");
    itemsMetas.weather = { count: healthReports.length };
    healthReports.forEach((healthReport) => {
      weatherFolder.file(`${healthReport._id}.json`, JSON.stringify(healthReport));
    });
  }

  // Export metadatas
  projectFolder.file("metadatas.json", JSON.stringify({ ...metadatas, items: itemsMetas }));

  // Project
  projectFolder.file("project.json", JSON.stringify(project));

  return zip;
};

export const projectFilesFromZip = (zip) => {
  if (!zip.files) return null;
  const projectRootPattern = /(.*)project.json/ig;
  const fileNames = Object.keys(zip.files);
  return fileNames.filter((fileName) => projectRootPattern.test(fileName));
};

export const unserializeProjectImportZip = async (zip) => {
  if (!zip.files) return null;
  const projectsFolders = projectFilesFromZip(zip).map(async (fileName) => {
    const projectFolderName = fileName.replace("project.json", "");
    return new ZipProject(zip.folder(projectFolderName));
  });
  return Promise.all(projectsFolders).then((projects) => projects);
};
