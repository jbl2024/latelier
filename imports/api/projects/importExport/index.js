import fs from "fs";
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
  const metas = { users: { count: Object.keys(users).length } };

  // Users
  projectFolder.file("users.json", JSON.stringify(users));
  
  // Tasks
  if (Array.isArray(tasksLists) && tasksLists.length > 0) {
    const tasksListsFolder = projectFolder.folder("tasks");
    metas.tasks = { count: 0 };
    tasksLists.forEach((list) => {
      metas.tasks.count += list.tasks.length;
      tasksListsFolder.file(`${list._id}.json`, JSON.stringify(list));
    });
  }

  // BPMN Diagrams
  if (Array.isArray(bpmnDiagrams) && bpmnDiagrams.length > 0) {
    const bpmnFolder = projectFolder.folder("bpmn");
    metas.bpmn = { count: bpmnDiagrams.length };
    bpmnDiagrams.forEach((diagram) => {
      bpmnFolder.file(`${diagram._id}.json`, JSON.stringify(diagram));
    });
  }

  // Meetings
  if (Array.isArray(meetings) && meetings.length > 0) {
    const meetingsFolder = projectFolder.folder("meetings");
    metas.meetings = { count: meetings.length };
    meetings.forEach((meeting) => {
      meetingsFolder.file(`${meeting._id}.json`, JSON.stringify(meeting));
    });
  }

  // Canvases
  if (Array.isArray(canvases) && canvases.length > 0) {
    const canvasesFolder = projectFolder.folder("canvas");
    metas.canvas = { count: canvases.length };
    canvases.forEach((canvas) => {
      canvasesFolder.file(`${canvas._id}.json`, JSON.stringify(canvas));
    });
  }

  // healthReports
  if (Array.isArray(healthReports) && healthReports.length > 0) {
    const weatherFolder = projectFolder.folder("weather");
    metas.weather = { count: healthReports.length };
    healthReports.forEach((healthReport) => {
      weatherFolder.file(`${healthReport._id}.json`, JSON.stringify(healthReport));
    });
  }

  // Project + Metas
  projectFolder.file("project.json", JSON.stringify(Object.assign({}, project, { metas })));

  return zip;
}

export const projectFilesFromZip = (zip) => {
  if (!zip.files) return null;
  const projectRootPattern = /(.*)project.json/ig;
  const fileNames = Object.keys(zip.files);
  return fileNames.filter(fileName => projectRootPattern.test(fileName));
}

export const unserializeProjectImportZip = async (zip) => {
  if (!zip.files) return null;
  const projectsFolders = projectFilesFromZip(zip).map(async (fileName) => {
    const projectFolderName = fileName.replace("project.json", "");
    return new ZipProject(zip.folder(projectFolderName));
  });
  return Promise.all(projectsFolders).then((projects) => {
    return projects;
  });
};

export const findProjectImportZip = (importPath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(importPath, (err, data) => {
      if (err) reject(new Meteor.Error("error", "Invalid project import", err));
      const buffer = Buffer.from(data, 'utf-8');
      resolve(JSZip.loadAsync(buffer));
    });
  });
}