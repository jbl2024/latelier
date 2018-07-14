import { Projects } from '../../api/projects/projects.js';
import { Lists } from '../../api/lists/lists.js';

if (Projects.find().count() === 0) {
  var projects = [
    {
      name: 'Acora',
    },
    {
      name: 'Cartora',
    },
    {
      name: 'Ideal',
    },
  ];

  projects.map(function (project) {
    var id;
    id = Projects.insert({
      name: project.name,
    });

    Lists.insert({
      projectId: id,
      name : 'list'
    });

  });  
}