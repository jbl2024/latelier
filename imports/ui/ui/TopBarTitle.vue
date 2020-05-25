<template>
  <div class="top-bar-title">
    <v-toolbar-title>
      <v-app-bar-nav-icon
        v-show="$vuetify.breakpoint.mdAndDown"
        @click.stop="showMobileDrawer = !showMobileDrawer"
      />
      <v-btn v-show="$vuetify.breakpoint.mdAndUp" text icon @click="goParent">
        <v-icon>{{ homeIcon }}</v-icon>
      </v-btn>
      <!-- Fast selector for any organizations or projects -->
      <content-selector :key="contentSelectorKey">
        <template v-slot:activator="{ on }">
          <v-btn
            v-shortkey="['p']"
            text
            v-on="on"
            @shortkey="on.click($event)"
          >
            <span class="title title-selector">
              {{ selectorTitle }}
            </span>
            <v-icon class="ml-1">
              mdi-chevron-down
            </v-icon>
          </v-btn>
        </template>
      </content-selector>
    </v-toolbar-title>
  </div>
</template>
<script>
import ContentSelector from "/imports/ui/widgets/ContentSelector";
import { truncate } from "/imports/ui/utils/truncate";

export default {
  components: {
    ContentSelector
  },
  props: {
    organization: {
      type: Object,
      default: null
    },
    project: {
      type: Object,
      default: null
    }
  },
  computed: {
    contentSelectorKey() {
      if (this.projectId) return this.projectId;
      if (this.organizationId) return this.organizationId;
      return "home";
    },
    projectId() {
      if (!this.project) return null;
      return this.project._id;
    },
    organizationId() {
      if (!this.organization) return null;
      return this.organization._id;
    },
    selectorTitle() {
      if (this.project) return this.project?.name ? truncate(this.project.name, 30) : "";
      if (this.organization) {
        return this.organization?.name
          ? truncate(this.organization.name, 30)
          : "";
      }
      return "L'atelier";
    },
    showMobileDrawer: {
      set(showMobileDrawer) {
        this.$store.commit("updateShowMobileDrawer", showMobileDrawer);
      },
      get() {
        return this.$store.state.showMobileDrawer;
      }
    },
    homeIcon() {
      if (this.project && this.project.organizationId) {
        return "mdi-view-dashboard";
      }
      return "mdi-home";
    }
  },
  methods: {
    async goParent() {
      const projectHasOrganization = this.project && this.project.organizationId;
      if (projectHasOrganization) {
        this.$store.dispatch("project/setCurrentProject", null);
        await this.$router.push({
          name: "dashboard-organization-page",
          params: { organizationId: this.project.organizationId }
        });
      } else {
        this.goHome();
      }
    },

    async goHome() {
      this.$store.dispatch("organization/setCurrentOrganization", null);
      this.$store.dispatch("project/setCurrentProject", null);
      const routeName = "dashboard-page";
      if (this.$route.name === routeName) return;
      await this.$router.push({ name: routeName });
    }
  }
};
</script>
<style lang="scss" scoped>
.top-bar-title .v-toolbar__title {
  display: flex;
  align-items: center;
}

.title-selector {
  text-transform: none;
}
</style>
