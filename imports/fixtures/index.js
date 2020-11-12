import faker from "faker";
import LatelierFaker from "/imports/fixtures/fakers";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import Fixture from "./Fixture";
import { Organizations } from "/imports/api/organizations/organizations";
import { Projects } from "/imports/api/projects/projects";
import { Tasks } from "/imports/api/tasks/tasks";
import { Lists } from "/imports/api/lists/lists";
import { Canvas } from "/imports/api/canvas/canvas";
import { HealthReports } from "/imports/api/healthReports/healthReports";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams";

/* To run fixture put this in main.js:
  import { generateFixtures } from "/imports/fixtures";
  Meteor.startup(() => {
    if (Meteor.settings.generateFixtures) generateFixtures();
  });
*/

// Register custom fakers methods
faker.locale = "fr";
LatelierFaker.register(faker);

// Users
export const usersFixtures = (count = 50) => {
  if (!count) return [];
  return Fixture.of(Meteor.users)
    .setFaker(faker)
    .generate(function () {
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
    }).insert(function (userData) {
      try {
        return Accounts.createUser(userData);
      } catch (err) {
        return null;
      }
    })
    .run(count);
};

// Organizations
export const organizationsFixtures = (count = 20, usersIds = []) => {
  if (!count) return [];
  return Fixture.of(Organizations)
    .setFaker(faker)
    .generate(function (users) {
      return {
        name: this.faker.latelier.organization.name(),
        createdAt: new Date(),
        createdBy: this.faker.random.arrayElement(users),
        members: []
      };
    }, usersIds)
    .run(count);
};

// Projects for each organization
export const projectsFixtures = (count = 8, usersIds = [], organizationsIds = []) => {
  if (!count) return [];
  return Fixture.of(Projects)
    .setFaker(faker)
    .generateForEach(organizationsIds, function (organizationId, users) {
      return {
        organizationId,
        createdBy: this.faker.random.arrayElement(users),
        state: this.faker.latelier.project.state(),
        features: this.faker.latelier.project.features(),
        name: this.faker.latelier.project.name(),
        createdAt: new Date()
      };
    }, usersIds).run(count);
};

// Lists of tasks for each project
export const listsFixtures = (count = 5, usersIds = [], projectsIds = []) => {
  if (!count) return [];
  const _findListLastOrder = function (projectId) {
    const list = Lists.findOne({ projectId }, { sort: { order: -1 } });
    if (list) {
      return list.order;
    }
    return 0;
  };
  let lastListOrder = null;
  return Fixture.of(Lists)
    .setFaker(faker)
    .generateForEach(projectsIds, function (projectId, users, index) {
      if (index === 0) {
        lastListOrder = _findListLastOrder(projectId);
      }
      const listName = this.faker.latelier.list.name();
      return {
        name: listName,
        order: lastListOrder + 1,
        autoComplete: listName === this.faker.latelier.list.completedName(),
        catchCompleted: false,
        projectId,
        createdAt: new Date(),
        createdBy: this.faker.random.arrayElement(users)
      };
    }, usersIds).run(count);
};

// Tasks for each list
export const tasksFixtures = (count = 80, usersIds = [], listsIds = []) => {
  if (!count) return [];
  const _findTaskFirstOrder = function (projectId, listId) {
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
  return Fixture.of(Tasks)
    .setFaker(faker)
    .generateForEach(listsIds, function (listId, users, index) {
      const list = Lists.findOne({ _id: listId });
      if (!list) return null;
      const author = this.faker.random.arrayElement(users);
      const now = new Date();
      if (index === 0) {
        firstTaskOrder = _findTaskFirstOrder(list.projectId, list._id);
      }
      const name = this.faker.latelier.task.name();
      return {
        projectId: list.projectId,
        listId: list._id,
        name,
        description: this.faker.random.arrayElement([null, this.faker.latelier.task.description()]),
        createdAt: now,
        updatedAt: now,
        completed: false,
        order: firstTaskOrder + 1,
        number: this.faker.random.number(),
        createdBy: author,
        updatedBy: author,
        watchers: [author].concat([this.faker.random.arrayElement(users)]),
        assignedTo: this.faker.random.arrayElement(users)
      };
    }, usersIds).run(count);
};

// Canvas for each project
export const canvasFixtures = (usersIds, projectsIds) => {
  if (!Array.isArray(projectsIds) || !projectsIds.length) return [];
  return Fixture.of(Canvas)
    .setFaker(faker)
    .generateForEach(projectsIds, function(projectId, users) {
      return {
        projectId,
        createdAt: new Date(),
        createdBy: this.faker.random.arrayElement(users),
        data: {
          goal: this.faker.lorem.paragraph(),
          budget: this.faker.lorem.paragraph(),
          team: this.faker.lorem.paragraph(),
          requirements: this.faker.lorem.paragraph(),
          resources: this.faker.lorem.paragraph(),
          risks: this.faker.lorem.paragraph(),
          milestones: this.faker.lorem.paragraph(),
          quality: this.faker.lorem.paragraph(),
          outcome: this.faker.lorem.paragraph(),
          customers: this.faker.lorem.paragraph(),
          planning: this.faker.lorem.paragraph()
        }
      };
    }, usersIds).run();
};

// Health reports for each project
export const healthReportsFixtures = (count = 10, usersIds, projectsIds) => {
  if (!count) return [];
  return Fixture.of(HealthReports)
    .setFaker(faker)
    .generateForEach(projectsIds, function(projectId, users) {
      return {
        projectId,
        name: this.faker.random.word(),
        description: this.faker.lorem.paragraph(),
        date: new Date(),
        weather: this.faker.latelier.healthReport.weather(),
        createdAt: new Date(),
        createdBy: this.faker.random.arrayElement(users)
      };
    }, usersIds).run(count);
};


// BPMN diagrams for each project
export const processDiagramsFixtures = (count = 5, usersIds, projectsIds) => {
  if (!count) return [];
  return Fixture.of(ProcessDiagrams)
    .setFaker(faker)
    .generateForEach(projectsIds, function(projectId, users) {
      return {
        projectId,
        name: this.faker.random.word(),
        description: this.faker.lorem.paragraph(),
        xml: this.faker.latelier.bpmn.diagramXML(),
        createdAt: new Date(),
        createdBy: this.faker.random.arrayElement(users)
      };
    }, usersIds).run(count);
};

export const generateFixtures = () => {
  const counts = {
    users: 1,
    organizations: 1,
    projects: 1,
    lists: 1,
    tasks: 1,
    healthReports: 1,
    processDiagrams: 1
  };

  const usersIds = usersFixtures(counts.users);
  const organizationsIds = organizationsFixtures(counts.organizations, usersIds);
  const projectsIds = projectsFixtures(counts.projects, usersIds, organizationsIds);
  const listsIds = listsFixtures(counts.lists, usersIds, projectsIds);
  const tasksIds = tasksFixtures(counts.tasks, usersIds, listsIds);
  const canvasesIds = canvasFixtures(usersIds, projectsIds);
  const healthReportsIds = healthReportsFixtures(counts.healthReports, usersIds, projectsIds);
  const processDiagramsIds = processDiagramsFixtures(counts.healthReports, usersIds, projectsIds);

  const countInserts = (ids) => {
    if (!ids || !Array.isArray(ids)) return -1;
    return ids.length;
  };

  return {
    users: countInserts(usersIds),
    organizations: countInserts(organizationsIds),
    projects: countInserts(projectsIds),
    lists: countInserts(listsIds),
    tasks: countInserts(tasksIds),
    canvas: countInserts(canvasesIds),
    healthReports: countInserts(healthReportsIds),
    processDiagrams: countInserts(processDiagramsIds)
  };
};
