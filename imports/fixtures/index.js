import faker from "faker";
import LatelierFaker from "./LatelierFaker";
import Fixture from "./Fixture";
import { Meteor } from "meteor/meteor";
import { Organizations } from "/imports/api/organizations/organizations";
import { Projects } from "/imports/api/projects/projects";
import { Tasks } from "/imports/api/tasks/tasks";
import { Lists } from "/imports/api/lists/lists";
import { Accounts } from "meteor/accounts-base";

/* To run fixture put this in main.js:
  import { generateFixtures } from "/imports/fixtures";
  Meteor.startup(() => {
    if (Meteor.settings.generateFixtures) generateFixtures();
  });
*/

export const generateFixtures = async () => {
  
  // Register custom fakers methods
  faker.locale = "fr";
  LatelierFaker.register(faker);

  // Users
  const usersIds = await Fixture.of(Meteor.users)
    .setFaker(faker)
    .generate(function() {
      const firstName = this.faker.name.firstName();
      const lastName = this.faker.name.lastName();
      const email = `${firstName}.${lastName}@latelierdesprojets.fr`;
      return {
        createdAt: new Date(),
        password: "password",
        email,
        profile: {
          firstName,
          lastName
        }
      };
    }).insert(function(userData) {
      try {
        return Accounts.createUser(userData);
      } catch (err) {
        return null;
      }
    }).run(10);
  
  // Organizations
  const organizationsIds = await Fixture.of(Organizations)
    .setFaker(faker)
    .generate(function(usersIds) {
      return {
        name: this.faker.latelier.organization.name(),
        createdAt: new Date(),
        createdBy: this.faker.random.arrayElement(usersIds),
        members: [],
      };
    }, usersIds)
    .run(10);

  // Projects per organization
  const projectsIds = await Fixture.of(Projects)
    .setFaker(faker)
    .generateForEach(organizationsIds, function(organizationId, usersIds) {
      return {
        organization: organizationId,
        createdBy: this.faker.random.arrayElement(usersIds),
        state: "development",
        name: this.faker.latelier.project.name(),
        createdAt: new Date()
      };
    }, usersIds).run(8);

  // Lists per project

  const _findListLastOrder = function(projectId) {
    const list = Lists.findOne({ projectId }, { sort: { order: -1 } });
    if (list) {
      return list.order;
    }
    return 0;
  };

  let lastTaskOrder = null;
  const listNames = ["À trier","À faire", "En cours", "À Valider", "Terminé"];

  const listsIds = await Fixture.of(Lists)
    .setFaker(faker)
    .generateForEach(projectsIds, function(projectId, usersIds, listNames, index) {
      if (index === 0) {
        lastTaskOrder = _findListLastOrder(projectId);
      }
      return {
        name: this.faker.random.arrayElement(listNames),
        order: lastTaskOrder + 1,
        autoComplete: false,
        catchCompleted: false,
        projectId,
        createdAt: new Date(),
        createdBy: this.faker.random.arrayElement(usersIds),
      };
    }, usersIds, listNames).run(5);


    const _findTaskFirstOrder = function() {
      const task = Tasks.findOne(
        { projectId, listId },
        { sort: { order: 1 } }
      );
      if (task) {
        return task.order;
      }
      return 0;
    };
    let firstTaskOrder = null;
    // Tasks per list per project
    await Fixture.of(Tasks)
      .setFaker(faker)
      .generateForEach(listsIds, function(listId, usersIds, index) {
        if (index === 0) {
          firstTaskOrder = _findTaskFirstOrder(projectId);
        }
        const list = Lists.findOne({ _id: listId });
        if (!list) return;
        const author = this.faker.random.arrayElement(usersIds);
        const now = new Date();

        const name = this.faker.latelier.task.name();
        return {
          projectId: list.projectId,
          listId: list._id,
          name,
          createdAt: now,
          updatedAt: now,
          completed: false,
          order: firstTaskOrder + 1,
          number: this.faker.random.number(),
          createdBy: author,
          updatedBy: author,
          watchers: [author].concat([this.faker.random.arrayElement(usersIds)]),
          assignedTo: this.faker.random.arrayElement(usersIds)
        }
      }, usersIds).run(40);
}
