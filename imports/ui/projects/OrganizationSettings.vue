<template>
  <div class="organization-settings"> 

    <div v-if="!$subReady.organization">
      <md-progress-bar md-mode="indeterminate"></md-progress-bar>
    </div>
    <div v-if="$subReady.organization" class="project-wrapper"> 

      <md-tabs md-sync-route :md-alignment="tabAlignment">
        <md-tab id="tab-general" md-label="Paramètres">
          
          <md-subheader>Titre</md-subheader>
          <div class="md-elevation-1">
            <div class="description">
              <div v-show="!editName && organization.name && organization.name.length > 0" @click="startEditName">
                {{ organization.name }}
              </div>
              <div v-show="!organization.name && !editName" @click="startEditName">
                Aucun nom
              </div>

              <div v-show="editName">
                <md-field>
                  <label>Nom</label>
                  <input ref="name" v-model="organization.name" @keyup.ctrl.enter="updateName"></md-textarea>
                </md-field>
                <md-button class="md-icon-button" @click.native="updateName">
                  <md-icon>check_circle</md-icon>
                </md-button>

                <md-button class="md-icon-button" @click.native="cancelUpdateName">
                  <md-icon>cancel</md-icon>
                </md-button>

              </div>
            </div>
          </div>

          <md-subheader>Description</md-subheader>
          <div class="md-elevation-1">
            <div class="description">
              <div v-show="!editDescription && organization.description && organization.description.length > 0" @click="startEditDescription">
                <div v-html="markDown(organization.description)"></div>
              </div>
              <div v-show="!organization.description && !editDescription" @click="startEditDescription">
                Aucune description
              </div>

              <div v-show="editDescription">
                <md-field>
                  <label>Description</label>
                  <md-textarea ref="description" v-model="organization.description" @keyup.ctrl.enter="updateDescription"></md-textarea>
                </md-field>
                <md-button class="md-icon-button" @click.native="updateDescription">
                  <md-icon>check_circle</md-icon>
                </md-button>

                <md-button class="md-icon-button" @click.native="cancelUpdateDescription">
                  <md-icon>cancel</md-icon>
                </md-button>

              </div>
            </div>
          </div>


        </md-tab>

        <md-tab id="tab-users" md-label="Utilisateurs">
        </md-tab>
      </md-tabs> 

    </div>
</div>
</template>

<script>
import { Organizations } from '/imports/api/organizations/organizations.js'
import MarkdownMixin from '/imports/ui/mixins/MarkdownMixin.js'

export default {
  mixins: [MarkdownMixin],
  mounted(){
    this.$store.dispatch('setCurrentOrganizationId', this.organizationId);    
    let self = this;
    this.$nextTick(function() {
      window.addEventListener("resize", function(e) {
        self.windowWidth = window.innerWidth;
      });
    });
  },
  created () {
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
      savedProjectName: '',
      editProjectName: false,
      editDescription: false
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
    startEditDescription () {
      this.savedDescription = this.organization.description;
      this.editDescription = true;
      this.$nextTick(() => this.$refs.description.$el.focus());
    },

    updateDescription () {
      this.editDescription = false;
      Meteor.call('organizations.updateDescription', this.organization._id, this.organization.description);
    },

    cancelUpdateDescription () {
      this.editDescription = false;
      this.organization.description = this.savedDescription;
    },
  }
}
</script>

<style scoped>

.description, .estimatedSize {
  margin-left: 24px;
  margin-right: 24px;
  margin-bottom: 12px;
  padding-top: 12px;
  padding-bottom: 12px;
}


</style>