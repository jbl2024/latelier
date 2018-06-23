import { Projects } from '../../api/projects/projects.js';

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
  });  
}