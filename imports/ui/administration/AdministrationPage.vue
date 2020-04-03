<template>
  <div class="administration-page">
    <template v-if="$subReady.user">
      <template v-if="isAdmin()">
        <v-tabs>
          <v-tabs-slider color="accent" />
          <v-tab id="tab-dashboard">
            {{ $t('Dashboard') }}
          </v-tab>
          <v-tab id="tab-users">
            {{ $t('Users') }}
          </v-tab>
          <v-tab id="tab-projects">
            {{ $t('Projects') }}
          </v-tab>
          <v-tab id="tab-users">
            {{ $t('BPMN examples') }}
          </v-tab>
          <v-tab id="tab-chat">
            {{ $t('Chat') }}
          </v-tab>
          <v-tab-item>
            <administration-dashboard />
          </v-tab-item>
          <v-tab-item>
            <administration-users />
          </v-tab-item>
          <v-tab-item>
            <administration-projects />
          </v-tab-item>
          <v-tab-item>
            <administration-bpmn-examples />
          </v-tab-item>
          <v-tab-item>
            <administration-chat/>
          </v-tab-item>
        </v-tabs>
      </template>
    </template>
  </div>
</template>

<script>
import { Permissions } from "/imports/api/permissions/permissions";

import AdministrationDashboard from "./dashboard/AdministrationDashboard";
import AdministrationUsers from "./users/AdministrationUsers";
import AdministrationProjects from "./projects/AdministrationProjects";
import AdministrationBpmnExamples from "./bpmn/AdministrationBpmnExamples";
import AdministrationChat from './chat/AdministrationChat';

export default {
  components: {
    AdministrationDashboard,
    AdministrationUsers,
    AdministrationProjects,
    AdministrationBpmnExamples,
    AdministrationChat
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
