<template>
  <project-title v-if="project" :project="project" @go-home="goHome" />
  <organization-title v-else-if="organizationId" :organization-id="organizationId" />
  <home-title v-else-if="!project" @go-home="goHome" />
</template>
<script>
export default {
  props: {
    organizationId: {
      type: String,
      default: null
    },
    project: {
      type: Object,
      default: null
    }
  },
  methods: {
    async goHome() {
      this.$store.dispatch("project/setCurrentProject", null);
      const routeName = "dashboard-page";
      if (this.$route.name === routeName) return;
      await this.$router.push({ name: routeName });
    }
  }
};
</script>
