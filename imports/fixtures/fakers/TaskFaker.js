import BaseFaker from "./BaseFaker";

export default class TaskFaker extends BaseFaker {
  name() {
    return this.faker.random.arrayElement([
      `Need info : ${this.faker.hacker.phrase()}`,
      `TODO: ${this.faker.hacker.phrase()}`,
      `Call ${this.faker.phone.phoneNumber()}`
    ]);
  }

  description() {
    return this.faker.lorem.paragraph();
  }
}
