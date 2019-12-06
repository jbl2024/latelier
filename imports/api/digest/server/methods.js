import { Tasks } from "/imports/api/tasks/tasks";
import { Organizations } from "/imports/api/organizations/organizations";
import { Projects } from "/imports/api/projects/projects";
import { Events } from "/imports/api/events/events";
import {
  Permissions,
  checkLoggedIn,
  checkCanReadProject
} from "/imports/api/permissions/permissions";

const methods = {};

methods.generateDigest = new ValidatedMethod({
  name: "digest.generate",
  validate: new SimpleSchema({
    projectId: { type: String },
    startDate: { type: Date },
    endDate: { type: Date }
  }).validator(),
  run({ projectId, startDate, endDate }) {
    checkCanReadProject(projectId);
    const maxLimit = 1500;

    const convertEventsToTasks = (events) => {
      const tasks = {};
      events.forEach((event) => {
        tasks[event.properties.task._id] = event.properties.task;
      });
      return Object.keys(tasks).map((key) => tasks[key]);
    };

    const createdEvents = Events.find({
      "properties.task.projectId": projectId,
      type: "tasks.create",
      createdAt: {
        $gte: startDate,
        $lt: endDate
      }
    }, {
      limit: maxLimit
    });

    const updatedEvents = Events.find({
      "properties.task.projectId": projectId,
      type: {
        $nin: [
          "tasks.create",
          "tasks.remove",
          "tasks.tasks.deleteForever"
        ]
      },
      createdAt: {
        $gte: startDate,
        $lt: endDate
      }
    }, {
      limit: maxLimit
    });

    const deletedEvents = Events.find({
      "properties.task.projectId": projectId,
      type: {
        $in: [
          "tasks.remove",
          "tasks.tasks.deleteForever"
        ]
      },
      createdAt: {
        $gte: startDate,
        $lt: endDate
      }
    }, {
      limit: maxLimit
    });

    return {
      startDate: startDate,
      endDate: endDate,
      tasks: {
        created: convertEventsToTasks(createdEvents),
        updated: convertEventsToTasks(updatedEvents),
        deleted: convertEventsToTasks(deletedEvents)
      }
    };
  }
});

export default methods;
