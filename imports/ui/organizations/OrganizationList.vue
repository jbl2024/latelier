<template>
  <div v-if="organizations" class="organization-list">
    <empty-state
      v-if="!organizations.length && emptyIllustration"
      :illustration="emptyIllustration"
      small
      :label="$t('No organizations')"
    />
    <v-list v-else-if="organizations.length > 0" two-line>
      <v-list-item
        v-for="organization in organizations"
        :key="organization._id"
        @click="selectOrganization(organization)"
      >
        <v-list-item-avatar>
          <v-icon>
            mdi-domain
          </v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ organization.name }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>

export default {
  name: "OrganizationList",
  props: {
    organizations: {
      type: Array,
      default: null
    },
    emptyIllustration: {
      type: String,
      default: null
    }
  },
  methods: {
    selectOrganization(organization) {
      this.$emit("select", organization);
    }
  }
};
</script>

<style lang="scss">
.organization-list {
  .v-list {
    padding: 0;
  }
  .empty-state {
    padding: 2rem;
  }
}
</style>
