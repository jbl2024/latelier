<template>
  <div class="organization-page">
    <new-organization ref="newOrganization"></new-organization>
    <organizations></organizations>
    <md-speed-dial class="absolute-right" md-direction="top" md-event="click">
      <md-speed-dial-target>
        <md-icon class="md-morph-initial">add</md-icon>
        <md-icon class="md-morph-final">close</md-icon>
      </md-speed-dial-target>

      <md-speed-dial-content>
        <md-button class="md-icon-button" @click="$refs.newOrganization.open()">
          <md-icon>folder</md-icon>
          <md-tooltip md-delay="300" md-direction="left">Nouvelle organisation</md-tooltip>
        </md-button>
      </md-speed-dial-content>
    </md-speed-dial>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  methods: {
  },
  meteor: {
  },
}
</script>

<style scoped>
</style>