
class ProjectFaker {
    constructor(faker) {
      this.faker = faker;
    }
    name() {
      return this.faker.random.arrayElement([
        `Project - ${this.faker.address.city()}`,
        `Project - ${this.faker.company.companySuffix()} - ${this.faker.company.catchPhraseNoun()}`,
        `Project - ${this.faker.company.companySuffix()} - ${this.faker.company.catchPhrase()}`,
        `Project - ${this.faker.company.bs()} - ${this.faker.company.bsNoun()}`,
        `Project - ${this.faker.company.bs()} - ${this.faker.company.bsAdjective()} - ${this.faker.company.bsBuzz()}`
      ])
    }
};


class OrganizationFaker {
  constructor(faker) {
    this.faker = faker;
  }
  name() {
    return this.faker.random.arrayElement([
      `Organization - ${this.faker.address.city()}`,
      `Organization - ${this.faker.company.companySuffix()} - ${this.faker.company.catchPhraseNoun()}`,
      `Organization - ${this.faker.company.companySuffix()} - ${this.faker.company.catchPhrase()}`,
      `Organization - ${this.faker.company.bs()} - ${this.faker.company.bsNoun()}`,
      `Organization - ${this.faker.company.bs()} - ${this.faker.company.bsAdjective()} - ${this.faker.company.bsBuzz()}`
    ])
  }
};

class TaskFaker {
  constructor(faker) {
    this.faker = faker;
  }
  name() {
    return this.faker.random.arrayElement([
      `Need info : ${this.faker.hacker.phrase()}`,
      `TODO: ${this.faker.hacker.phrase()}`,
      `Call ${this.faker.phone.phoneNumber()}`
    ]);
  }
};

export default class LatelierFaker {
  static register(faker) {
    faker.latelier = {
      project: new ProjectFaker(faker),
      task: new TaskFaker(faker),
      organization: new OrganizationFaker(faker)
    };
  }
}