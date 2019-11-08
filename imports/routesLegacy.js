import multiguard from "vue-router-multiguard";
import { isBasicAuth, projectAuth } from "./router/check-auth";
import ProjectsTimeline from "/imports/ui/projects/ProjectsTimeline.vue";
import ProjectTimeline from "/imports/ui/projects/ProjectTimeline.vue";
import ProcessDiagram from "/imports/ui/projects/ProjectProcessDiagram.vue";

import modern from "./routes";

const legacy = [
  {
    path: "/timeline/:organizationId",
    name: "projects-timeline",
    beforeEnter: isBasicAuth,
    component: ProjectsTimeline,
    props: true
  },
  {
    path: "/projects-timeline/:projectId",
    name: "project-timeline",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: ProjectTimeline,
    props: true
  },
  {
    path: "/projects-bpmn/:projectId/:processDiagramId",
    name: "project-bpmn-process-diagram",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: ProcessDiagram,
    props: true
  }
];

const routes = modern.filter((route) => {
  const legacyAlternative = legacy.find((legacyRoute) => legacyRoute.path === route.path);
  return legacyAlternative || route;
});

export default routes;
