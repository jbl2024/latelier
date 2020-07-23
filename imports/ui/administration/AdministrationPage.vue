<template>
  <div class="administration-page">
    <template v-if="isConnected && isAdmin">
      <v-tabs ref="tabs" v-resize="centerTabs" centered class="sticky-tabs">
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
        <v-tab id="tab-meetings">
          {{ $t('meetings.meetings') }}
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
          <administration-meetings />
        </v-tab-item>
        <v-tab-item :transition="false" :reverse-transition="false">
          <administration-bpmn-examples />
        </v-tab-item>
      </v-tabs>
    </template>
  </div>
</template>

<script>

import { mapGetters } from "vuex";
import AdministrationDashboard from "./dashboard/AdministrationDashboard";
import AdministrationUsers from "./users/AdministrationUsers";
import AdministrationProjects from "./projects/AdministrationProjects";
import AdministrationMeetings from "./meetings/AdministrationMeetings";
import AdministrationBpmnExamples from "./bpmn/AdministrationBpmnExamples";

export default {
  components: {
    AdministrationDashboard,
    AdministrationUsers,
    AdministrationProjects,
    AdministrationMeetings,
    AdministrationBpmnExamples
  },
  computed: {
    ...mapGetters(["isConnected", "isAdmin"])
  },
  methods: {
    centerTabs() {
      setTimeout(() => {
        this.$refs.tabs.onResize();
      }, 500);
    }
  }
};
</script>

<style scoped>
.administration-page {
  height: 400px; /* fix sticky on webkit */
}
</style>
