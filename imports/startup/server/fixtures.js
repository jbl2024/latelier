import { Projects } from "../../api/projects/projects.js";
import { Lists } from "../../api/lists/lists.js";
import faker from "faker";
import { Organizations } from "../../api/organizations/organizations.js";


function generateFixtures() {
  var users = Meteor.users.find().fetch();
  users.map(user => {
    if (user._id != "TAGRk8jBBZAkMMYmc") {
      //Meteor.users.remove(user._id);
    }
  });
  if (Meteor.users.find().count() <= 2) {
    faker.locale = "fr";

    for (var i = 0; i < 50; i++) {
      var firstName = faker.name.firstName();
      var lastName = faker.name.lastName();
      var email = firstName + "." + lastName + "@gmail.com";

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
