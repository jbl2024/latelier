import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Tasks } from '/imports/api/tasks/tasks.js'
import { Organizations } from '/imports/api/organizations/organizations.js'
import { Projects } from '/imports/api/projects/projects.js'
import { Permissions } from '/imports/api/users/permissions'

Meteor.methods({
  "dashboards.findTasks"(user, type, page) {
    
    const userId = Meteor.userId();

    const perPage = 10;
    let skip = 0;
    if (page) {
      skip = (page - 1) * perPage;
    }

    if (!skip) {
      skip = 0;
    }
    let query = {
      completed: false
    }

    let queryProjects = {}

    if (!Permissions.isAdmin(userId)) {
      const organizations = Organizations.find({'$or': [{members: userId}, {isPublic: true}]}, {fields: {_id: 1}}).fetch();
      const organizationIds = [];
      organizations.map(organization => {
        organizationIds.push(organization._id)
      });

      const projects = Projects.find({organizationId: {$in: organizationIds}, '$or': [{createdBy: userId}, {members: userId}, {isPublic: true}]}, {fields: {_id: 1}}).fetch();
      const projectIds = [];
      projects.map(project => {
        projectIds.push(project._id);
      })
      query.projectId = {$in: projectIds};
    }
  
    let sort = {}

    const count = Tasks.find(query).count();
    if (type === 'recent') {
      sort = {
        updatedAt: -1
      };
    } else if (type === 'assignedToMe') {
      query.assignedTo = user._id;

      sort = {
        updatedAt: -1
      };
    } else if (type === 'late') {
      query.dueDate = {
        $lte: new Date()
      }
      sort = {
        dueDate: 1
      };
    }
    
    console.log(query)
    const data = Tasks
      .find(
        query,
        {
          skip: skip,
          limit: perPage,
          sort: sort
        }
      )
      .fetch();

    // load associated projects and assign them to tasks
    const projects = {};
    data.map(task => {
      let project = projects[task.projectId];
      if (!project) {
        projects[task.projectId] = Projects.findOne({_id: task.projectId});
        project = projects[task.projectId];
        if (!project) return;
      }
      task.project = project;
    });

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data: data
    };
  }
});