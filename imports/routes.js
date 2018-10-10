import { isBasicAuth } from "../imports/modules/check-auth";

import NotFound from "/imports/ui/pages/NotFound/NotFound.vue";

import Home from "/imports/ui/Home.vue";
import Auth from "../imports//ui/layout/Auth.vue";
import Login from "../imports/ui/pages/Auth/Login.vue";
import Register from "../imports/ui/pages/Auth/Register.vue";
import ForgotPassword from "../imports/ui/pages/Auth/ForgotPassword.vue";
import ResetPassword from "../imports/ui/pages/Auth/ResetPassword.vue";

import OrganizationsPage from "/imports/ui/organizations/OrganizationsPage.vue";
import OrganizationSettings from "/imports/ui/organizations/OrganizationSettings.vue";
import ProjectsPage from "/imports/ui/projects/ProjectsPage.vue";
import Project from "/imports/ui/projects/Project.vue";
import ProjectSettings from "/imports/ui/projects/ProjectSettings.vue";
import ProjectTimeline from "/imports/ui/projects/ProjectTimeline.vue";
import ProjectAttachmentsPage from "/imports/ui/projects/ProjectAttachmentsPage.vue";
import Admin from "/imports/ui/admin/Admin.vue";
import ProjectsTimeline from "/imports/ui/projects/ProjectsTimeline.vue";

export default [
  {
    path: "/",
    name: "home",
    component: Home,
    beforeEnter: (to, from, next) => {
      if (Meteor.userId()) {
        next({
          name: "organizations-page"
        });
      } else {
        next();
      }
    }
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
    path: "/organizations/:organizationId/settings",
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
    path: "/projects/:organizationId/:projectId/settings",
    name: "project-settings",
    beforeEnter: isBasicAuth,
    component: ProjectSettings,
    props: true
  },
  {
    path: "/projects/:organizationId/:projectId/timeline",
    name: "project-timeline",
    beforeEnter: isBasicAuth,
    component: ProjectTimeline,
    props: true
  },
  {
    path: "/projects/:organizationId/:projectId/attachments",
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
    path: "/admin",
    name: "admin",
    beforeEnter: isBasicAuth,
    component: Admin,
    props: true
  },
  { path: "*", name: "not-found", component: NotFound }
];
