<template>
  <div class="organization-settings">
    <div v-if="!currentOrganization">
      <v-progress-linear indeterminate />
    </div>
    <div v-else class="project-wrapper">
      <v-tabs>
        <v-tab id="tab-general">
          {{ $t('Settings' ) }}
        </v-tab>
        <v-tab id="tab-users">
          {{ $t('Users') }}
        </v-tab>
        <v-tab-item
          :transition="false"
          :reverse-transition="false"
          class="organization-settings-tab-item"
        >
          <organization-settings-general :organization="currentOrganization" />
        </v-tab-item>
        <v-tab-item
          :transition="false"
          :reverse-transition="false"
          class="organization-settings-tab-item"
        >
          <organization-settings-manage-users :organization="currentOrganization" class="users" />
        </v-tab-item>
      </v-tabs>
    </div>
  </div>
</template>

<script>
import { Organizations } from "/imports/api/organizations/organizations.js";
import { mapState } from "vuex";

export default {
  props: {
    organizationId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      windowWidth: window.innerWidth,
      title: this.$t("Settings")
    };
  },
  computed: {
    ...mapState("organization", ["currentOrganization"])
  },
  mounted() {
    this.$store.dispatch("project/setCurrentProject", null);
    this.$store.dispatch("organization/setCurrentOrganizationId", this.organizationId);
  },
  beforeDestroy() {
    this.$store.dispatch("organization/setCurrentOrganizationId", null);
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
  }
};
</script>

<style lang="scss" scoped>
.organization-settings-tab-item {
  padding: 2rem;
}
</style>
