import JSZip from "jszip";
import ZipProject from "/imports/api/projects/importExport/ZipProject";
import fs from "fs";

export const items = [
  "tasks",
  "users",
  "meetings",
  "bpmn",
  "canvas",
  "weather",
  "attachments"
];

export const getAttachmentContent = (attachment) => new Promise((resolve, reject) => {
  fs.readFile(attachment.path, (err, data) => {
    if (err) reject(err);
    resolve(data);
  });
});

export const getFileBaseName = (fileName) => {
  if (!fileName) return "";
  return fileName.split("/").pop();
};

export const createProjectExportZip = async ({
  metadatas,
  project,
  users,
  tasksLists,
  labels,
  bpmnDiagrams,
  meetings,
  canvas,
  healthReports,
  attachments
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

  // Labels
  if (Array.isArray(labels) && labels.length > 0) {
    projectFolder.file("labels.json", JSON.stringify(labels));
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
    itemsMetas.canvas = { count: 1 };
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

  // Attachments
  if (Array.isArray(attachments) && attachments.length > 0) {
    const attachmentsFolder = projectFolder.folder("attachments");
    itemsMetas.attachments = { count: attachments.length };

    /* eslint no-restricted-syntax: "off" */
    for (attachment of attachments) {
      /* eslint no-await-in-loop: "off" */
      const data = await getAttachmentContent(attachment);
      attachmentsFolder.file(`${attachment._id} - ${attachment.name}`, data);
    }
    attachmentsFolder.file("metadatas.json", JSON.stringify(attachments));
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

export const linkAttachmentsToFiles = (files, attachments) => {
  if (!Array.isArray(files) || !files.length) return [];
  if (!Array.isArray(attachments) || !attachments.length) return files;
  attachments.forEach((attachment) => {
    const foundFile = files.find((file) => {
      const fileName = getFileBaseName(file.name);
      return fileName.startsWith(attachment._id);
    });
    if (foundFile) {
      foundFile.attachment = attachment;
    }
  });
  return files;
};
