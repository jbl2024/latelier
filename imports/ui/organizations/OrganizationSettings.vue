<template>
  <div class="organization-settings"> 

    <div v-if="!$subReady.organization">
      <md-progress-bar md-mode="indeterminate"></md-progress-bar>
    </div>
    <div v-if="$subReady.organization" class="project-wrapper"> 

      <md-tabs md-sync-route :md-alignment="tabAlignment">
        <md-tab id="tab-general" md-label="Paramètres">
          <organization-settings-general :organization="organization"></organization-settings-general>
        </md-tab>

        <md-tab id="tab-users" md-label="Utilisateurs">
        </md-tab>
      </md-tabs> 

    </div>
</div>
</template>

<script>
import { Organizations } from '/imports/api/organizations/organizations.js'

export default {
  mounted(){
    this.$store.dispatch('setCurrentOrganizationId', this.organizationId);    
    let self = this;
    this.$nextTick(function() {
      window.addEventListener("resize", function(e) {
        self.windowWidth = window.innerWidth;
      });
    });
  },
  beforeDestroy() {
    this.$store.dispatch('setCurrentOrganizationId', 0);    
  },
  computed:{
      tabAlignment(){
        return this.windowWidth > 600 ? "left" : "fixed";
      }
  },
  props: {
    organizationId: {
      type: String,
      default: '0'
    }
  },
  data () {
    return {
      windowWidth: window.innerWidth,
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