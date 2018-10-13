<template>
  <div class="projects-page">
    <projects :organizationId="organizationId"></projects>
  </div>
</template>

<script>
export default {
  mounted () {
    this.$store.dispatch('setCurrentOrganizationId', this.organizationId);    
  },
  beforeDestroy() {
    this.$events.off('projects-loaded');
    this.$store.dispatch('setCurrentOrganizationId', 0);    
  },
  props: {
    organizationId: {
      type: String,
      default: '0'
    }
  },

  data () {
    return {}
  },
  methods: {
  },
  meteor: {
  },
}
</script>

<style scoped>
</style>