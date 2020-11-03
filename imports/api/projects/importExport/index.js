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

export const parseProjectImportZip = async (zip) => {
  if (!zip.files) return null;
  const projectRootPattern = /(.*)project.json/ig;
  const fileNames = Object.keys(zip.files);
  const projectsFolders = fileNames.filter(fileName => projectRootPattern.test(fileName)).map(async (fileName) => {
    const projectFolderName = fileName.replace("project.json", "");
    return new ZipProject(zip.folder(projectFolderName));
  });
  return Promise.all(projectsFolders).then((projects) => {
    return projects;
  });
};