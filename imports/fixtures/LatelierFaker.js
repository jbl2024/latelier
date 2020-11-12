


class BaseFaker {
  constructor(faker) {
    this.faker = faker;
  }
  capitalize(s) {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
}

class ProjectFaker extends BaseFaker {
    name() {
      return this.capitalize(this.faker.random.arrayElement([
        `${this.faker.address.city()}`,
        `${this.faker.company.companySuffix()} - ${this.faker.company.catchPhraseNoun()}`,
        `${this.faker.company.companySuffix()} - ${this.faker.company.catchPhrase()}`,
        `${this.faker.company.bs()} - ${this.faker.company.bsNoun()}`,
        `${this.faker.company.bs()} - ${this.faker.company.bsAdjective()} - ${this.faker.company.bsBuzz()}`
      ]));
    }
};


class OrganizationFaker extends BaseFaker {
  name() {
    return this.capitalize(this.faker.random.arrayElement([
      `${this.faker.address.city()} ${this.faker.company.companySuffix()}`,
      `${this.faker.company.companySuffix()} - ${this.faker.company.catchPhraseNoun()}`,
      `${this.faker.company.companySuffix()} - ${this.faker.company.catchPhrase()}`,
      `${this.faker.company.bs()} - ${this.faker.company.bsNoun()}`,
      `${this.faker.company.bs()} - ${this.faker.company.bsAdjective()} - ${this.faker.company.bsBuzz()}`
    ]));
  }
};

class TaskFaker extends BaseFaker {
  name() {
    return this.faker.random.arrayElement([
      `Need info : ${this.faker.hacker.phrase()}`,
      `TODO: ${this.faker.hacker.phrase()}`,
      `Call ${this.faker.phone.phoneNumber()}`
    ]);
  }
};

class ListFaker extends BaseFaker {
  name() {
    return this.faker.random.arrayElement(["À trier","À faire", "En cours", "À Valider", this.completedName()]);
  }
  completedName() {
    return "Terminé";
  }
}

export default class LatelierFaker {
  static register(faker) {
    faker.latelier = {
      project: new ProjectFaker(faker),
      task: new TaskFaker(faker),
      list: new ListFaker(faker),
      organization: new OrganizationFaker(faker)
    };
    return faker;
  }
}