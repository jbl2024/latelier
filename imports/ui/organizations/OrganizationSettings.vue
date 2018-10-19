<template>
  <div class="organization-settings"> 

    <div v-if="!$subReady.organization">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <div v-if="$subReady.organization" class="project-wrapper"> 

      <v-tabs>
        <v-tab id="tab-general">
          Paramètres
        </v-tab>
        <v-tab id="tab-users">
          Utilisateurs
        </v-tab>
        <v-tab-item>
          <organization-settings-general :organization="organization"></organization-settings-general>
        </v-tab-item>
        <v-tab-item>
          <organization-settings-manage-users :organization="organization" class="users"></organization-settings-manage-users>
        </v-tab-item>
      </v-tabs> 


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