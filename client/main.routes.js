export default [
  {
    path: '/',
    name: 'home',
    component: '/imports/ui/Home.vue',
  },
  {
    path: '/projects/:projectId',
    name: 'projects',
    component: '/imports/ui/projects/Project.vue',
    props: true
  },
];