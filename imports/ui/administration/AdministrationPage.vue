<template>
  <div class="administration-page">
    <template v-if="isConnected && isAdmin">
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
        <v-tab-item :transition="false" :reverse-transition="false">
          <administration-dashboard />
        </v-tab-item>
        <v-tab-item :transition="false" :reverse-transition="false">
          <administration-users />
        </v-tab-item>
        <v-tab-item :transition="false" :reverse-transition="false">
          <administration-projects />
        </v-tab-item>
        <v-tab-item :transition="false" :reverse-transition="false">
          <administration-bpmn-examples />
        </v-tab-item>
      </v-tabs>
    </template>
  </div>
</template>

<script>

import AdministrationDashboard from "./dashboard/AdministrationDashboard";
import AdministrationUsers from "./users/AdministrationUsers";
import AdministrationProjects from "./projects/AdministrationProjects";
import AdministrationBpmnExamples from "./bpmn/AdministrationBpmnExamples";
import { mapGetters } from "vuex";
export default {
  components: {
    AdministrationDashboard,
    AdministrationUsers,
    AdministrationProjects,
    AdministrationBpmnExamples
  },
  computed: {
    ...mapGetters([
      "isConnected", 
      "isAdmin"
    ])
  }
};
</script>
