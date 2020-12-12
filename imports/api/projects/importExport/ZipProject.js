export default class ZipProject {
  constructor(zipFolder) {
    this.zipFolder = zipFolder;
    this.onlyJsonPattern = /./;
    this.allExcepJsonPattern = /^[^.]+$|\.(?!(json)$)([^.]+$)/;
  }

  /* eslint class-methods-use-this: "off" */
  isJsonSingleFile(item) {
    return [
      "project",
      "users",
      "canvas",
      "labels",
      "metadatas",
      "attachments/metadatas"
    ].includes(item);
  }

  getZipFolder() {
    return this.zipFolder;
  }

  getFolder(item) {
    return this.zipFolder.folder(item);
  }

  getFiles(item) {
    if (this.isJsonSingleFile(item)) {
      return [this.zipFolder.file(`${item}.json`)];
    }
    const folder = this.getFolder(item);
    const filePattern = item === "attachments"
      ? this.allExcepJsonPattern : this.onlyJsonPattern;
    const files = folder.file(filePattern);
    return files;
  }

  async getContent(item) {
    const isJsonSingleFile = this.isJsonSingleFile(item);
    const files = this.getFiles(item);
    if (!Array.isArray(files) || !files.length) return [];
    if (isJsonSingleFile && !files[0]) return null;
    const parseContent = async (file) => {
      if (file.name.endsWith(".json")) {
        const rawJson = await file.async("string");
        return JSON.parse(rawJson);
      }
      return file.async("string");
    };

    // content
    return isJsonSingleFile ? parseContent(files[0])
      : Promise.all(files.map(parseContent));
  }
}
