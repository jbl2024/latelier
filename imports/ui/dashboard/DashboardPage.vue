<template>
  <div class="dashboard-page">
    <dashboard-desktop
      v-if="$vuetify.breakpoint.smAndUp"
      :organization-id="organizationId"
    />
    <dashboard-mobile
      v-if="$vuetify.breakpoint.xsOnly"
      :organization-id="organizationId"
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
      handler (id) {
        this.$store.dispatch("setCurrentOrganizationId", id);
      }
    }
  },
  mounted() {
    this.$store.dispatch("setWindowTitle", this.$t("Dashboard"));
    this.$store.dispatch("setShowDashboardTitle", true);
  },
  beforeDestroy() {
    this.$store.dispatch("setShowDashboardTitle", false);
    this.$store.dispatch("setCurrentOrganizationId", null);
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
