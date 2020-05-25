<template>
  <dashboard-projects v-if="currentUser" />
</template>

<script>
import DashboardProjects from "/imports/ui/dashboard/mobile/DashboardProjects";
import { mapState } from "vuex";

export default {
  components: {
    DashboardProjects
  },
  computed: {
    ...mapState(["currentUser"])
  },
  mounted() {
    this.$store.dispatch("setWindowTitle", this.$t("Dashboard"));
  }
};
</script>

<style lang="scss" scoped>

@import "/imports/ui/styles/mixins/breakpoint";


</style>
