// Import the router
import { RouterFactory, nativeScrollBehavior } from 'meteor/akryum:vue-router2'

// Create router instance
const routerFactory = new RouterFactory({
  mode: 'history',
  scrollBehavior: nativeScrollBehavior
});

// Not found
import NotFound from '/imports/ui/NotFound.vue';

RouterFactory.configure(router => {
  router.addRoute({
    path: '*',
    component: NotFound,
  });
}, -1);

export default routerFactory;