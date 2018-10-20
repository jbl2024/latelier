<template>
  <div class="organization-resourcesPage">
    <div v-if="!$subReady.organization">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <template v-if="$subReady.organization">
      <organization-resources :organization="organization"></organization-resources>
    </template>
  </div>
</template>

<script>
import { Organizations } from '/imports/api/organizations/organizations.js'

export default {
  mounted () {
    this.$store.dispatch('setCurrentOrganizationId', this.organizationId);    
  },
  beforeDestroy() {
    this.$store.dispatch('setCurrentProjectId', 0);    
  },
  props: {
    organizationId: {
      type: String,
      default: '0'
    }
  },
  data () {
    return {
    }
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      'organization': function() {
        return [this.organizationId] 
      }
    },
    organization () {
      return Organizations.findOne();
    }
  },
  methods: {
   
  }
}
</script>

<style scoped>

</style>