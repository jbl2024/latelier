import BaseFaker from "./BaseFaker";
import { HealthReportsWeathers } from "/imports/api/healthReports/healthReports";

export default class HealthReportFaker extends BaseFaker {
  weather() {
    return this.faker.random.arrayElement(HealthReportsWeathers);
  }
}
