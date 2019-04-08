<template>
  <div class="dashboard-page">
    <dashboard-desktop></dashboard-desktop>
  </div>
</template>

<script>
import DashboardDesktop from "/imports/ui/dashboard/desktop/DashboardDesktop";
import DashboardMobile from "/imports/ui/dashboard/mobile/DashboardMobile";

export default {
  props: {},
  components: {
    DashboardDesktop,
    DashboardMobile
  },
  mounted() {
    this.$store.dispatch("setWindowTitle", this.$t("Dashboard"));
  }
};
</script>