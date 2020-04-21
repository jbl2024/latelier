<template>
  <home-title v-if="!projectId"/>
  <project-title v-else-if="projectId" :project-id="projectId"/>
</template>
<script>
import { mapState } from 'vuex';
export default {
  props: {
    projectId: {
      type: String,
      default: null
    }
  }
}
</script>