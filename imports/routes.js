import { isBasicAuth, projectAuth } from "./router/check-auth";
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
import ProjectSettings from "/imports/ui/projects/ProjectSettings.vue";
import ProjectBPMN from "/imports/ui/projects/ProjectBPMN.vue";
import ProjectCanvas from "/imports/ui/projects/ProjectCanvas.vue";
import ProjectWeather from "/imports/ui/projects/ProjectWeather.vue";
import ProjectAttachmentsPage from "/imports/ui/projects/ProjectAttachmentsPage.vue";

import AdministrationPage from "/imports/ui/administration/AdministrationPage.vue";
import MailSettingsPage from "/imports/ui/settings/MailSettingsPage.vue";
import ProfileSettingsPage from "/imports/ui/settings/ProfileSettingsPage.vue";
import DashboardPage from "/imports/ui/dashboard/DashboardPage.vue";
import ProjectInfo from "/imports/ui/projects/ProjectInfo.vue";

export default [
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
        component: Login
      },
      {
        path: "/registration-completed",
        name: "registration-completed",
        component: RegistrationCompleted
      },
      {
        path: "/register",
        name: "register",
        component: Register
      },
      {
        path: "/forgot-password",
        name: "forgot-password",
        component: ForgotPassword
      },
      {
        path: "/reset-password/:token",
        name: "reset-password",
        component: ResetPassword
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
    props: true
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
    props: true
  },
  {
    path: "/projects/:projectId",
    name: "project",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: Project,
    props: true
  },
  {
    path: "/projects-settings/:projectId",
    name: "project-settings",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: ProjectSettings,
    props: true
  },
  {
    path: "/projects-dashboard/:projectId",
    name: "project-dashboard",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: ProjectInfo,
    props: true
  },
  {
    path: "/projects-timeline/:projectId",
    name: "project-timeline",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: async () => (await import("/imports/ui/projects/ProjectTimeline.vue")).default,
    props: true
  },
  {
    path: "/projects-bpmn/:projectId",
    name: "project-bpmn",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: ProjectBPMN,
    props: true
  },
  {
    path: "/projects-bpmn/:projectId/:processDiagramId",
    name: "project-bpmn-process-diagram",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: async () => (await import("/imports/ui/projects/ProjectProcessDiagram.vue")).default,
    props: true
  },
  {
    path: "/projects-canvas/:projectId",
    name: "project-canvas",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: ProjectCanvas,
    props: true
  },
  {
    path: "/projects-weather/:projectId",
    name: "project-weather",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: ProjectWeather,
    props: true
  },
  {
    path: "/projects-attachments/:projectId",
    name: "project-attachments-page",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: ProjectAttachmentsPage,
    props: true
  },
  {
    path: "/projects/:projectId/:taskId",
    name: "project-task",
    beforeEnter: multiguard([isBasicAuth, projectAuth]),
    component: Project,
    props: true
  },
  {
    path: "/tasks/:taskNumber",
    name: "project-task-number",
    beforeEnter: isBasicAuth,
    component: TaskRedirect,
    props: true
  },
  {
    path: "/administration",
    name: "administration-page",
    beforeEnter: isBasicAuth,
    component: AdministrationPage,
    props: true
  },
  {
    path: "/settings/mail",
    name: "mail-settings-page",
    beforeEnter: isBasicAuth,
    component: MailSettingsPage,
    props: true
  },
  {
    path: "/settings/profile",
    name: "profile-settings-page",
    beforeEnter: isBasicAuth,
    component: ProfileSettingsPage,
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
    props: true
  },
  { path: "*", name: "not-found", component: NotFound }
];
