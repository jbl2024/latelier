<template>
  <div class="project-attachments-page">
    <div v-if="!$subReady.project">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <div v-if="$subReady.project">

      <empty-state
        v-show="attachments.length == 0"
        rounded
        icon="attachment"
        label="Aucune pièce jointe"
        description="Vous pouvez ajouter une pièce jointe sur une tâche">
      </empty-state>

      <v-list two-line subheader v-show="attachments.length > 0">
        <v-subheader>Pièces jointes</v-subheader>
        <v-list-tile v-for="attachment in attachments" :key="attachment._id">
          <v-list-tile-avatar>
            <v-icon>description</v-icon>
          </v-list-tile-avatar>            

          <v-list-tile-content class="pointer">
            <v-list-tile-title>
              <a class="link"  :href="link(attachment)"  target="_blank">{{ attachment.name }}</a>          
            </v-list-tile-title>
            <v-list-tile-sub-title>
              <router-link class="link-subtitle" :to="{ name: 'project-task', params: { projectId: attachment.meta.projectId, taskId: attachment.meta.taskId }}">{{ getTask(attachment).name }}</router-link>
            </v-list-tile-sub-title>
          </v-list-tile-content>

          <v-list-tile-action>
            <v-btn icon flat color="grey darken-1" @click.stop="deleteAttachment(attachment)">
              <v-icon>delete</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list> 
    </div>
  </div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import { Attachments } from '/imports/api/attachments/attachments.js'
import { mapState } from 'vuex';

export default {
  mounted () {
    this.$store.dispatch('setCurrentProjectId', this.projectId);    
  },
  beforeDestroy() {
    this.$store.dispatch('setCurrentProjectId', 0);    
  },
  props: {
    projectId: {
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
      'project': function() {
        return [this.projectId] 
      }
    },
    project () {
      return Projects.findOne();
    },

    attachments: {
      params () {
        return {
          projectId: this.projectId
        };
      },
      update ({projectId}) {
        const attachments = Attachments.find({'meta.projectId': this.projectId}, {sort: {'meta.taskId': 1, 'name': 1}}).fetch();
        return attachments.filter(attachment => {
          return Tasks.findOne({_id: attachment.meta.taskId}) 
        })
      }
    }    
  },
  methods: {
    link (attachment) {
      return Attachments.link(attachment);
    },

    getTask (attachment) {
      return Tasks.findOne({_id: attachment.meta.taskId});
    },

    deleteAttachment (attachment) {
      this.$confirm(this.$t("Delete attachment?"), {
        title: attachment.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then(res => {
        if (res) {
          Meteor.call('attachments.remove', attachment._id);
        }
      });
    },

  }
}
</script>

<style scoped>
.toolbar {
  background-color: white;
}

.empty-state {
  margin-top: 24px;
}

.link {
  text-decoration: none !important;
  color: black;
}

.link-subtitle {
  text-decoration: none !important;
  color: rgba(0,0,0,.54);
}
</style>