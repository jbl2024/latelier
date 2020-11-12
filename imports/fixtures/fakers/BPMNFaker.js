import BaseFaker from "./BaseFaker";

export default class BPMNFaker extends BaseFaker {
  diagramXML() {
    return this.loadData(Assets.absoluteFilePath("fixtures/bpmn/example.xml"));
  }
}
