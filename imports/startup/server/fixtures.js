import faker from "faker";

function generateFixtures() {
  if (Meteor.users.find().count() <= 2) {
    faker.locale = "fr";

    for (let i = 0; i < 50; i++) {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const email = `${firstName}.${lastName}@latelierdesprojets.fr`;

      const userData = {
        createdAt: new Date(),
        password: "password",
        email,
        profile: {
          firstName,
          lastName
        }
      };
      /* eslint no-console: off */
      console.log(userData);

      Accounts.createUser(userData);
    }
  }
}

if (Meteor.settings.generateFixtures) {
  generateFixtures();
}
