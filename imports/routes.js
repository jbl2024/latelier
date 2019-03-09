import { isBasicAuth } from "../imports/modules/check-auth";

import NotFound from "/imports/ui/pages/NotFound/NotFound.vue";

import Home from "/imports/ui/Home.vue";
import Auth from "../imports//ui/layout/Auth.vue";
import Login from "../imports/ui/pages/Auth/Login.vue";
import RegistrationCompleted from "../imports/ui/pages/Auth/RegistrationCompleted.vue";
import Register from "../imports/ui/pages/Auth/Register.vue";
import ForgotPassword from "../imports/ui/pages/Auth/ForgotPassword.vue";
import ResetPassword from "../imports/ui/pages/Auth/ResetPassword.vue";

import OrganizationsPage from "/imports/ui/organizations/OrganizationsPage.vue";
import OrganizationSettings from "/imports/ui/organizations/OrganizationSettings.vue";
import OrganizationResourcesPage from "/imports/ui/organizations/OrganizationResourcesPage.vue";
import ProjectsPage from "/imports/ui/projects/ProjectsPage.vue";
import Project from "/imports/ui/projects/Project.vue";
import ProjectSettings from "/imports/ui/projects/ProjectSettings.vue";
import ProjectTimeline from "/imports/ui/projects/ProjectTimeline.vue";
import ProjectCanvas from "/imports/ui/projects/ProjectCanvas.vue";
import ProjectWeather from "/imports/ui/projects/ProjectWeather.vue";
import ProjectAttachmentsPage from "/imports/ui/projects/ProjectAttachmentsPage.vue";
import ProjectsTimeline from "/imports/ui/projects/ProjectsTimeline.vue";

import AdministrationPage from "/imports/ui/administration/AdministrationPage.vue";
import MailSettingsPage from "/imports/ui/settings/MailSettingsPage.vue";

export default [
  {
    path: "/",
    name: "home",
    component: Home,
    beforeEnter: isBasicAuth
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
    path: "/organizations-resources/:organizationId",
    name: "organization-resources-page",
    beforeEnter: isBasicAuth,
    component: OrganizationResourcesPage,
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
    component: ProjectsTimeline,
    props: true
  },
  {
    path: "/projects/:organizationId/:projectId",
    name: "project",
    beforeEnter: isBasicAuth,
    component: Project,
    props: true
  },
  {
    path: "/projects-settings/:organizationId/:projectId",
    name: "project-settings",
    beforeEnter: isBasicAuth,
    component: ProjectSettings,
    props: true
  },
  {
    path: "/projects-timeline/:organizationId/:projectId",
    name: "project-timeline",
    beforeEnter: isBasicAuth,
    component: ProjectTimeline,
    props: true
  },
  {
    path: "/projects-canvas/:organizationId/:projectId",
    name: "project-canvas",
    beforeEnter: isBasicAuth,
    component: ProjectCanvas,
    props: true
  },
  {
    path: "/projects-weather/:organizationId/:projectId",
    name: "project-weather",
    beforeEnter: isBasicAuth,
    component: ProjectWeather,
    props: true
  },
  {
    path: "/projects-attachments/:organizationId/:projectId",
    name: "project-attachments-page",
    beforeEnter: isBasicAuth,
    component: ProjectAttachmentsPage,
    props: true
  },
  {
    path: "/projects/:organizationId/:projectId/:taskId",
    name: "project-task",
    beforeEnter: isBasicAuth,
    component: Project,
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
  { path: "*", name: "not-found", component: NotFound }
];
