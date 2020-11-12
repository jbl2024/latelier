import fs from "fs";

export default class BaseFaker {
  constructor(faker) {
    this.faker = faker;
  }

  /* eslint class-methods-use-this: off */
  loadData(path, options) {
    options = options || { encoding: "utf8", flag: "r" };
    return fs.readFileSync(path, options);
  }

  /* eslint class-methods-use-this: off */
  capitalize(s) {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
