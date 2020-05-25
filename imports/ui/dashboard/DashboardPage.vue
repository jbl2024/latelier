<template>
  <div class="dashboard-page">
    <dashboard-desktop
      v-if="organizationId || $vuetify.breakpoint.mdAndUp"
      :key="organizationId ? organizationId : 'home'"
      :organization-id="organizationId"
    />
    <dashboard-mobile
      v-if="!organizationId && $vuetify.breakpoint.smAndDown"
    />
  </div>
</template>

<script>
import DashboardDesktop from "/imports/ui/dashboard/desktop/DashboardDesktop";
import DashboardMobile from "/imports/ui/dashboard/mobile/DashboardMobile";

export default {
  components: {
    DashboardDesktop,
    DashboardMobile
  },
  props: {
    organizationId: {
      type: String,
      default: null
    }
  },
  watch: {
    organizationId: {
      immediate: true,
      handler(organizationId) {
        this.$store.dispatch("organization/setCurrentOrganizationId", organizationId);
      }
    }
  },
  mounted() {
    this.$store.dispatch("project/setCurrentProject", null);
    this.$store.dispatch("setWindowTitle", this.$t("Dashboard"));
    this.$store.dispatch("setShowDashboardTitle", true);
  },
  beforeDestroy() {
    this.$store.dispatch("setShowDashboardTitle", false);
    this.$store.dispatch("organization/setCurrentOrganizationId", null);
  }
};
</script>

<style scoped>
.dashboard-page {
  display: flex;
  min-height: 0;
  height: 100%;
  flex-direction: column;
  position: relative;
  flex: 1;
  position: relative;
}
</style>
