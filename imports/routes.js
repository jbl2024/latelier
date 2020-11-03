import { Meteor } from "meteor/meteor";
import { isBasicAuth, projectAuth, meetingAuth, checkSsoAuth } from "./router/check-auth";
import { projectHasFeature, organizationHasFeature } from "./router/guards";
import multiguard from "vue-router-multiguard";

import NotFound from "/imports/ui/pages/NotFound/NotFound.vue";

import Auth from "/imports//ui/layout/Auth.vue";
import Login from "/imports/ui/pages/Auth/Login.vue";
import Forbidden from "/imports/ui/pages/Forbidden/Forbidden.vue";
import RegistrationCompleted from "/imports/ui/pages/Auth/RegistrationCompleted.vue";
import Register from "/imports/ui/pages/Auth/Register.vue";
import ForgotPassword from "/imports/ui/pages/Auth/ForgotPassword.vue";
import ResetPassword from "/imports/ui/pages/Auth/ResetPassword.vue";

import OrganizationsPage from "/imports/ui/organizations/OrganizationsPage.vue";
import OrganizationSettings from "/imports/ui/organizations/OrganizationSettings.vue";
import ProjectsPage from "/imports/ui/projects/ProjectsPage.vue";
import Project from "/imports/ui/projects/Project.vue";
import TaskRedirect from "/imports/ui/projects/TaskRedirect.vue";
import DashboardPage from "/imports/ui/dashboard/DashboardPage.vue";
import ProjectInfo from "/imports/ui/projects/ProjectInfo.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: DashboardPage,
    beforeEnter: isBasicAuth
  },
  {
    path: "/forbidden/",
    name: "forbidden",
    component: Forbidden
  },
  {
    path: "/login",
    component: Auth,
    redirect: { name: "login" },
    children: [
      {
        path: "/login",
        name: "login",
        component: Login,
        beforeEnter: checkSsoAuth,
        meta: {
          anonymous: true
        }
      },
      {
        path: "/registration-completed",
        name: "registration-completed",
        component: RegistrationCompleted,
        beforeEnter: checkSsoAuth,
        meta: {
          anonymous: true
        }
      },
      {
        path: "/register",
        name: "register",
        component: Register,
        beforeEnter: checkSsoAuth,
        meta: {
          anonymous: true
        }
      },
      {
        path: "/forgot-password",
        name: "forgot-password",
        component: ForgotPassword,
        beforeEnter: checkSsoAuth,
        meta: {
          anonymous: true
        }
      },
      {
        path: "/reset-password/:token",
        name: "reset-password",
        component: ResetPassword,
        beforeEnter: checkSsoAuth,
        meta: {
          anonymous: true
        }
      }
    ]
  },
  {
    path: "/organizations",
    name: "organizations-page",
    beforeEnter: isBasicAuth,
    component: OrganizationsPage,
    props: true
  },
  {
    path: "/organizations-settings/:organizationId",
    name: "organization-settings",
    beforeEnter: isBasicAuth,
    component: OrganizationSettings,
    props: true,
    meta: {
      isOrganization: true
    }
  },
  {
    path: "/organizations/:organizationId",
    name: "projects-page",
    beforeEnter: isBasicAuth,
    component: ProjectsPage,
    props: true
  },
  {
    path: "/timeline/:organizationId",
    name: "projects-timeline",
    beforeEnter: isBasicAuth,
    component: async () => (await import("/imports/ui/projects/ProjectsTimeline.vue")).default,
    props: true,
    meta: {
      isOrganization: true
    }
  },
  {
    path: "/projects/:projectId",
    name: "project",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: Project,
    props: true,
    meta: {
      isProject: true
    }
  },
  {
    path: "/projects-settings/:projectId",
    name: "project-settings",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: async () => (await import("/imports/ui/projects/ProjectSettings.vue")).default,
    props: true,
    meta: {
      isProject: true
    }
  },
  {
    path: "/projects-dashboard/:projectId",
    name: "project-dashboard",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: ProjectInfo,
    props: true,
    meta: {
      isProject: true
    }
  },
  {
    path: "/projects-timeline/:projectId",
    name: "project-timeline",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: async () => (await import("/imports/ui/projects/ProjectTimeline.vue")).default,
    props: true,
    meta: {
      isProject: true
    }
  },
  {
    path: "/projects-bpmn/:projectId",
    name: "project-bpmn",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: async () => (await import("/imports/ui/projects/ProjectBPMN.vue")).default,
    props: true,
    meta: {
      isProject: true
    }
  },
  {
    path: "/projects-bpmn/:projectId/:processDiagramId",
    name: "project-bpmn-process-diagram",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: async () => (await import("/imports/ui/projects/ProjectProcessDiagram.vue")).default,
    props: true,
    meta: {
      isProject: true
    }
  },
  {
    path: "/projects-canvas/:projectId",
    name: "project-canvas",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: async () => (await import("/imports/ui/projects/ProjectCanvas.vue")).default,
    props: true,
    meta: {
      isProject: true
    }
  },
  {
    path: "/projects-weather/:projectId",
    name: "project-weather",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: async () => (await import("/imports/ui/projects/ProjectWeather.vue")).default,
    props: true,
    meta: {
      isProject: true
    }
  },
  {
    path: "/projects/:projectId/:taskId",
    name: "project-task",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: Project,
    props: true,
    meta: {
      isProject: true
    }
  },
  {
    path: "/projects-export/:projectId",
    name: "project-export",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: async () => (await import("/imports/ui/projects/ProjectImportExport/ProjectExport.vue")).default,
    props: true,
    meta: {
      isProject: true
    }
  },
  {
    path: "/tasks/:taskNumber",
    name: "project-task-number",
    beforeEnter: isBasicAuth,
    component: TaskRedirect,
    props: true,
    meta: {
      isProject: true
    }
  },
  {
    path: "/administration",
    name: "administration-page",
    beforeEnter: isBasicAuth,
    component: async () => (await import("/imports/ui/administration/AdministrationPage.vue")).default,
    props: true
  },
  {
    path: "/settings/mail",
    name: "mail-settings-page",
    beforeEnter: isBasicAuth,
    component: async () => (await import("/imports/ui/settings/MailSettingsPage.vue")).default,
    props: true
  },
  {
    path: "/settings/profile",
    name: "profile-settings-page",
    beforeEnter: isBasicAuth,
    component: async () => (await import("/imports/ui/settings/ProfileSettingsPage.vue")).default,
    props: true
  },
  {
    path: "/dashboard",
    name: "dashboard-page",
    beforeEnter: isBasicAuth,
    component: DashboardPage,
    props: true
  },
  {
    path: "/dashboard/:organizationId",
    name: "dashboard-organization-page",
    beforeEnter: isBasicAuth,
    component: DashboardPage,
    props: true,
    meta: {
      isOrganization: true
    }
  },
  {
    path: "/projects-meetings/:projectId/:date?",
    name: "project-meetings",
    beforeEnter: multiguard([isBasicAuth, projectAuth, projectHasFeature("meetings")]),
    component: async () => (await import("/imports/ui/meetings/MeetingsDashboard.vue")).default,
    props: true,
    meta: {
      isProject: true
    }
  },
  {
    path: "/organizations-meetings/:organizationId/:date?",
    name: "organization-meetings",
    beforeEnter: multiguard([isBasicAuth, organizationHasFeature("meetings")]),
    component: async () => (await import("/imports/ui/meetings/MeetingsDashboard.vue")).default,
    props: true,
    meta: {
      isOrganization: true
    }
  },
  {
    path: "/meetings/:projectId/:meetingId",
    name: "meetings",
    beforeEnter: multiguard([isBasicAuth, meetingAuth, projectHasFeature("meetings")]),
    component: async () => (await import("/imports/ui/meetings/MeetingPage/MeetingPage.vue")).default,
    props: true
  },
  { path: "*", name: "not-found", component: NotFound }
];

if (!Meteor.settings.public.disableAttachments) {
  routes.push({
    path: "/projects-attachments/:projectId",
    name: "project-attachments-page",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: async () => (await import("/imports/ui/projects/ProjectAttachmentsPage.vue")).default,
    props: true,
    meta: {
      isProject: true
    }
  });
}

export default routes;
