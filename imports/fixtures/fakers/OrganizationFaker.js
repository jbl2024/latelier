import BaseFaker from "./BaseFaker";

export default class OrganizationFaker extends BaseFaker {
  name() {
    return this.capitalize(this.faker.random.arrayElement([
      `${this.faker.address.city()} ${this.faker.company.companySuffix()}`,
      `${this.faker.company.companySuffix()} - ${this.faker.company.catchPhraseNoun()}`,
      `${this.faker.company.companySuffix()} - ${this.faker.company.catchPhrase()}`,
      `${this.faker.company.bs()} - ${this.faker.company.bsNoun()}`,
      `${this.faker.company.bs()} - ${this.faker.company.bsAdjective()} - ${this.faker.company.bsBuzz()}`
    ]));
  }
}
