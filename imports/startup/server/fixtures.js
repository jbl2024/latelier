import faker from "faker";

function generateFixtures() {
  var users = Meteor.users.find().fetch();
  if (Meteor.users.find().count() <= 2) {
    faker.locale = "fr";

    for (var i = 0; i < 50; i++) {
      var firstName = faker.name.firstName();
      var lastName = faker.name.lastName();
      var email = firstName + "." + lastName + "@latelierdesprojets.fr";

      let userData = {
        createdAt: new Date(),
        password: "password",
        email: email,
        profile: {
          firstName: firstName,
          lastName: lastName
        }
      };
      console.log(userData);

      Accounts.createUser(userData);
    }
  }
}

if (Meteor.settings.generateFixtures) {
  generateFixtures();
}
