<template>
  <project-title v-if="projectId" :project-id="projectId"/>
  <organization-title v-else-if="organizationId" :organization-id="organizationId"/>
  <home-title v-else-if="!projectId"/>
</template>
<script>
import { mapState } from 'vuex';
export default {
  props: {
    organizationId: {
      type: String,
      default: null
    },
    projectId: {
      type: String,
      default: null
    }
  }
}
</script>