<template>
  <div class="dashboard-page">
    <dashboard
      :key="organizationId ? organizationId : 'home'"
      :organization-id="organizationId"
    />
  </div>
</template>

<script>
import Dashboard from "/imports/ui/dashboard/Dashboard";

export default {
  components: {
    Dashboard
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
