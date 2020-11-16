export default class ZipProject {
  constructor(zipFolder) {
    this.zipFolder = zipFolder;
    this.content = {};
  }

  /* eslint class-methods-use-this: "off" */
  isSingleFile(item) {
    return [
      "project",
      "users",
      "canvas",
      "labels",
      "metadatas"
    ].includes(item);
  }

  getZipFolder() {
    return this.zipFolder;
  }

  getFiles(item) {
    if (this.isSingleFile(item)) {
      return [this.zipFolder.file(`${item}.json`)];
    }
    const folder = this.zipFolder.folder(item);
    const files = folder.file(/.json/);
    return files;
  }

  async getContent(item) {
    if (this.content[item]) return this.content[item];
    const isSingleFile = this.isSingleFile(item);
    const files = this.getFiles(item);
    if (!Array.isArray(files) || !files.length) return [];
    if (isSingleFile && !files[0]) return null;
    const parseJson = async (file) => {
      const rawJson = await file.async("string");
      return JSON.parse(rawJson);
    };
    this.content[item] = isSingleFile
      ? await parseJson(files[0]) : await Promise.all(files.map(parseJson));
    return this.content[item];
  }
}
