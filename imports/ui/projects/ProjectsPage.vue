<template>
  <div class="projects-page">
    <projects :organization-id="organizationId" />
  </div>
</template>

<script>
import { Organizations } from "/imports/api/organizations/organizations.js";

export default {
  props: {
    organizationId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      title: this.$t("Projects")
    };
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      organization() {
        return [this.organizationId];
      }
    },
    organization() {
      const organization = Organizations.findOne();
      if (organization) {
        this.$store.dispatch("organization/setCurrentOrganization", organization);
      }
      return organization;
    }
  },
  mounted() {
    this.$store.dispatch("project/setCurrentProject", null);
    this.$store.dispatch("setWindowTitle", this.$t("Projects"));
    this.$store.dispatch("organization/setCurrentOrganizationId", this.organizationId);
  },
  beforeDestroy() {
    this.$events.off("projects-loaded");
    this.$store.dispatch("organization/setCurrentOrganizationId", null);
  }
};
</script>
