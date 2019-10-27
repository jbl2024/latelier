<template>
  <div class="organization-settings">
    <div v-if="!$subReady.organization">
      <v-progress-linear indeterminate />
    </div>
    <div v-if="$subReady.organization" class="project-wrapper">
      <v-tabs>
        <v-tab id="tab-general">
          {{ $t('Settings' ) }}
        </v-tab>
        <v-tab id="tab-users">
          {{ $t('Users') }}
        </v-tab>
        <v-tab-item>
          <organization-settings-general :organization="organization" />
        </v-tab-item>
        <v-tab-item>
          <organization-settings-manage-users :organization="organization" class="users" />
        </v-tab-item>
      </v-tabs>
    </div>
  </div>
</template>

<script>
import { Organizations } from "/imports/api/organizations/organizations.js";

export default {
  props: {
    organizationId: {
      type: String,
      default: "0"
    }
  },
  data() {
    return {
      windowWidth: window.innerWidth,
      title() {
        return this.$t("Settings");
      }
    };
  },
  mounted() {
    this.$store.dispatch("setCurrentOrganizationId", this.organizationId);
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentOrganizationId", 0);
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      organization() {
        return [this.organizationId];
      }
    },
    organization() {
      return Organizations.findOne();
    }
  },
  methods: {}
};
</script>

<style scoped>
</style>
