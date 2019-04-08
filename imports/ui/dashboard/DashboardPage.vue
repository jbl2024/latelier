<template>
  <div class="dashboard-page">
    <dashboard-desktop v-if="$vuetify.breakpoint.smAndUp"></dashboard-desktop>
    <dashboard-mobile v-if="$vuetify.breakpoint.xsOnly"></dashboard-mobile>
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