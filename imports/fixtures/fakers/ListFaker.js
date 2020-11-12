import BaseFaker from "./BaseFaker";

export default class ListFaker extends BaseFaker {
  name() {
    return this.faker.random.arrayElement(["À trier", "À faire", "En cours", "À Valider", this.completedName()]);
  }

  /* eslint class-methods-use-this: off */
  completedName() {
    return "Terminé";
  }
}
