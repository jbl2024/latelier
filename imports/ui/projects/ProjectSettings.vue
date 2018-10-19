<template>
  <div class="project-settings"> 

    <div v-if="!$subReady.project">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <div v-if="$subReady.project" class="project-wrapper"> 

      <md-tabs md-sync-route :md-alignment="tabAlignment">
        <md-tab id="tab-general" md-label="Paramètres">
          <project-settings-general :project="project"></project-settings-general>
        </md-tab>

        <md-tab id="tab-users" md-label="Utilisateurs">
          <project-settings-manage-users :project="project" class="users"></project-settings-manage-users>
        </md-tab>
      </md-tabs> 

    </div>
</div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import debounce from 'lodash/debounce';

export default {
  mounted(){
    this.$store.dispatch('setCurrentProjectId', this.projectId);    
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
    this.$store.dispatch('setCurrentProjectId', 0);    
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
    },
    projectId: {
      type: String,
      default: '0'
    }
  },
  data () {
    return {
      windowWidth: window.innerWidth,
      savedProjectName: '',
      editProjectName: false,
    }
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      'project': function() {
        return [this.projectId] 
      }
    },
    project () {
      return Projects.findOne();
    }
  },
  methods: {
    startUpdateProjectName () {
      this.savedProjectName = this.project.name;
      this.editProjectName = true;
      this.$nextTick(() => this.$refs.name.focus())
    },

    updateProjectName () {
      this.editProjectName = false;
      Meteor.call('projects.updateName', this.project._id, this.project.name);
    },

    cancelUpdateProjectName () {
      this.editProjectName = false;
      this.project.name = this.savedProjectName;
    },
  }
}
</script>

<style scoped>


.toolbar {
  background-color: white;
}

.search {
  max-width: 300px;
}

.md-content { 
  padding: 8px;
}

.project-settings {
  display: flex;
  flex-direction: column;
  background-color: white;
  height: 100%;
}

.users {
  overflow-y: scroll;
}

.edit-project-name input {
  font-size: 20px;
  font-weight: 400;
  letter-spacing: .02em;
  margin-top: 6px;
  padding: 0;
  font-family: Roboto,Noto Sans,-apple-system,BlinkMacSystemFont,sans-serif;
}

.edit-project-name .md-button {
  margin: 0;
}

@media (max-width: 600px) {
  .container {
    margin: 4px;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@media (min-width: 601px) {
  .container {
    margin: 4px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: scroll;
    padding-left: 4px;
  }
}

.container-wrapper {
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
}

.md-menu-item {
  cursor: pointer;
}

.absolute-right {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
}

</style>