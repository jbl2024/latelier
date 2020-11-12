import BaseFaker from "./BaseFaker";
import { ProjectFeatures, ProjectStates } from "/imports/api/projects/projects";

export default class ProjectFaker extends BaseFaker {
  name() {
    return this.capitalize(this.faker.random.arrayElement([
      `${this.faker.address.city()}`,
      `${this.faker.company.companySuffix()} - ${this.faker.company.catchPhraseNoun()}`,
      `${this.faker.company.companySuffix()} - ${this.faker.company.catchPhrase()}`,
      `${this.faker.company.bs()} - ${this.faker.company.bsNoun()}`,
      `${this.faker.company.bs()} - ${this.faker.company.bsAdjective()} - ${this.faker.company.bsBuzz()}`
    ]));
  }

  /* eslint class-methods-use-this: off */
  features() {
    return ProjectFeatures.slice();
  }

  state() {
    this.faker.random.arrayElement(ProjectStates);
  }
}
