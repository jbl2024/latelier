import BaseFaker from "./BaseFaker";
import { MeetingState } from "/imports/api/meetings/meetings";

export default class MeetingFaker extends BaseFaker {
  name() {
    return this.faker.company.bsBuzz();
  }

  description() {
    return this.faker.lorem.paragraph();
  }

  state() {
    return this.faker.random.arrayElement(MeetingState);
  }
}
