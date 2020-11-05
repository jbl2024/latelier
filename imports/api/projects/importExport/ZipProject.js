export default class ZipProject {
    constructor(zipFolder) {
      this.zipFolder = zipFolder;
      this.project = null;
      this.tasksLists = null;
    }
    getZipFolder() {
      return this.zipFolder;
    }
    async getProject() {
      if (this.project !== null) return this.project;
      const projectRawJson = await this.zipFolder.file("project.json").async("string");
      this.project = JSON.parse(projectRawJson);
      return this.project;
    }

    async getTasksLists() {
      if (this.tasksLists !== null) return this.tasksLists;
      const tasksListsFiles = this.getContent("tasks");
      this.tasksLists = await Promise.all(tasksListsFiles.map(async (file) => {
        const taskRawJson = await file.async("string");
        return JSON.parse(taskRawJson);
      }));
      return this.tasksLists;
    }

    getContent(item) {
      if (["project", "users"].includes(item)) {
        return this.zipFolder.file(`${item}.json`) !== null;
      }
      const folder = this.zipFolder.folder(item);
      const files = folder.file(/.json/);
      return files;
    }
}