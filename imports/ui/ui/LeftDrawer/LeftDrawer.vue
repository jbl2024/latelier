<template>
  <v-navigation-drawer
    v-if="hasLeftDrawer"
    id="left-drawer"
    v-model="showLeftDrawer"
    :mini-variant.sync="isMini"
    :width="leftDrawerWidth"
    app
    clipped
  >
    <div class="left-drawer-content">
      <div class="upper">
        <left-drawer-header
          :current-category="currentCategory"
          :mini="isMini"
          @toggle-collapse="isMini = !isMini"
          @change-category="currentCategory = $event"
        />
        <div v-show="!isMini" class="content">
          <v-divider />
          <!-- Tasks -->
          <task-drawer-lists
            v-show="currentCategory === 'tasks'"
            :user="currentUser"
            :project-id="currentProjectId"
            :organization-id="currentOrganizationId"
          />
          <!-- Meetings -->
          <meeting-drawer-lists
              v-show="currentCategory === 'meetings'"
              :user="currentUser"
              :project-id="currentProjectId"
              :organization-id="currentOrganizationId"
            />
          <!-- History -->
          <div v-show="currentCategory === 'history'">
            <project-history v-if="currentProjectId" :key="currentProjectId" :project-id="currentProjectId" />
          </div>
        </div>
      </div>
      <div v-show="!isMini" class="bottom">
        <left-drawer-footer/>
      </div>
    </div>
  </v-navigation-drawer>
</template>
<script>

import LeftDrawerHeader from "./LeftDrawerHeader";
import LeftDrawerFooter from "./LeftDrawerFooter";
import TaskDrawerLists from "/imports/ui/tasks/TaskDrawer/TaskDrawerLists";
import MeetingDrawerLists from "/imports/ui/meetings/MeetingDrawer/MeetingDrawerLists";
import { mapState } from "vuex";

export default {
  components: {
    LeftDrawerHeader,
    LeftDrawerFooter,
    TaskDrawerLists,
    MeetingDrawerLists
  },
  data() {
    return {
      isMini: false
    }
  },
  computed: {
    currentCategory: {
      get() {
        return this.$store.state.ui.leftDrawer.currentCategory;
      },
      set(value) {
        this.$store.dispatch("ui/leftDrawer/setCurrentCategory", value);
      }
    },
    ...mapState(["currentUser"]),
    ...mapState("organization", ["currentOrganizationId"]),
    ...mapState("project", ["currentProjectId"]),
    leftDrawerWidth() {
      return this.$vuetify.breakpoint.smAndDown ? "100%" : 304;
    },
    showLeftDrawer: {
      get() {
        return this.$store.state.ui.leftDrawer.showLeftDrawer;
      },
      set(value) {
        this.$store.dispatch("ui/leftDrawer/showLeftDrawer", value);
      }
    },
    hasLeftDrawer() {
      /*
      const routeName = this.$route?.name;
      return Boolean(["home", "dashboard-page", "dashboard-organization-page", "project-dashboard", "project-meetings"].includes(routeName));
      */
      return true;
    },
  }
};
</script>
<style lang="scss">
  .left-drawer-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
</style>