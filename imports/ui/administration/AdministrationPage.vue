<template>
  <div class="administration-page">
    <template v-if="$subReady.user">
      <template v-if="isAdmin()">
        <v-tabs>
          <v-tab id="tab-users">
            Utilisateurs
          </v-tab>
          <v-tab id="tab-users">
            {{ $t('BPMN examples') }}
          </v-tab>
          <v-tab-item>
            <administration-users />
          </v-tab-item>
          <v-tab-item>
            <administration-bpmn-examples />
          </v-tab-item>
        </v-tabs>
      </template>
    </template>
  </div>
</template>

<script>
import { Permissions } from "/imports/api/permissions/permissions";

export default {
  props: {},

  data() {
    return {};
  },
  meteor: {
    $subscribe: {
      user: function() {
        return [];
      }
    }
  },
  methods: {
    isAdmin() {
      return Permissions.isAdmin(Meteor.userId());
    }
  }
};
</script>

<style scoped></style>
