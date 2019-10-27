<template>
  <div class="projects-page">
    <projects :organization-id="organizationId" />
  </div>
</template>

<script>
export default {
  props: {
    organizationId: {
      type: String,
      default: "0"
    }
  },
  data() {
    return {
      title() {
        return this.$t("Projects");
      }
    };
  },
  mounted() {
    this.$store.dispatch("setWindowTitle", this.$t("Projects"));
    this.$store.dispatch("setCurrentOrganizationId", this.organizationId);
  },
  beforeDestroy() {
    this.$events.off("projects-loaded");
    this.$store.dispatch("setCurrentOrganizationId", 0);
  },
  methods: {},
  meteor: {}
};
</script>

<style scoped></style>
