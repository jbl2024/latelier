import ProjectFaker from "./ProjectFaker";
import TaskFaker from "./TaskFaker";
import ListFaker from "./ListFaker";
import OrganizationFaker from "./OrganizationFaker";
import BPMNFaker from "./BPMNFaker";
import HealthReportFaker from "./HealthReportFaker";

export default class LatelierFaker {
  static register(faker) {
    faker.latelier = {
      project: new ProjectFaker(faker),
      task: new TaskFaker(faker),
      list: new ListFaker(faker),
      organization: new OrganizationFaker(faker),
      bpmn: new BPMNFaker(faker),
      healthReport: new HealthReportFaker(faker)
    };
    return faker;
  }
}
