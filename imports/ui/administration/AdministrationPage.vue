<template>
  <div class="administration-page">
    <template v-if="$subReady.user">
      <template v-if="isAdmin()">
        <v-tabs>
          <v-tabs-slider color="accent" />
          <v-tab id="tab-users">
            {{ $t('Users') }}
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

import AdministrationUsers from "./users/AdministrationUsers";
import AdministrationBpmnExamples from "./bpmn/AdministrationBpmnExamples";

export default {
  components: {
    AdministrationUsers,
    AdministrationBpmnExamples
  },
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
