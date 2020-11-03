export default class ZipProject {
    constructor(zipFolder) {
      this.zipFolder = zipFolder;
      this.project = null;
      this.itemsToImport = null;
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

    getItemsToExport() {
      if (this.itemsToImport !== null) return this.itemsToImport;
      const itemsToImport = [];

      const hasContent = (zip, folderName) => {
        const folder = zip.folder(folderName);
        const items = folder.file(/.json/);
        return Boolean(items && items.length > 0);
      }

      if (this.zipFolder.file("users.json") !== null) {
        itemsToImport.push("users");
      }

      if (hasContent(this.zipFolder, "tasks")) {
        itemsToImport.push("tasks");
      }

      if (hasContent(this.zipFolder, "meetings")) {
        itemsToImport.push("meetings");
      }

      if (hasContent(this.zipFolder, "bpmn")) {
        itemsToImport.push("bpmn");
      }

      if (hasContent(this.zipFolder, "canvas")) {
        itemsToImport.push("canvas");
      }

      if (hasContent(this.zipFolder, "weather")) {
        itemsToImport.push("weather");
      }
      
      this.itemsToImport = itemsToImport;
      return this.itemsToImport;
    }
}