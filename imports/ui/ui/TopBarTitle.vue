<template>
  <project-title v-if="project" :project="project" @go-home="goParent" />
  <organization-title
    v-else-if="organization"
    :organization="organization"
    @go-home="goHome"
  />
  <home-title v-else-if="!project" @go-home="goHome" />
</template>
<script>
export default {
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
