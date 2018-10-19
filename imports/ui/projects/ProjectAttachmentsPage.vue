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
            
      <md-list class="md-double-line">
          <md-list-item v-for="attachment in attachments" :key="attachment._id">
            <md-icon>description</md-icon>
            <div class="md-list-item-text">
              <a :href="link(attachment)" target="_blank" class="md-list-item-text">{{ attachment.name }}</a>
              <router-link :to="{ name: 'project-task', params: { organizationId: this.currentOrganizationId, projectId: attachment.meta.projectId, taskId: attachment.meta.taskId }}">{{ getTask(attachment).name }}</router-link>
            </div>
            <md-button class="md-icon-button md-list-action" @click="deleteAttachment(attachment)">
              <md-icon>delete</md-icon>
            </md-button>
          </md-list-item>
      </md-list>

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
    this.$store.dispatch('setCurrentOrganizationId', this.organizationId);    
  },
  beforeDestroy() {
    this.$store.dispatch('setCurrentProjectId', 0);    
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
  computed: {
    ...mapState(['currentOrganizationId'])
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
        return Attachments.find({'meta.projectId': this.projectId}, {sort: {'meta.taskId': 1, 'name': 1}});
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
      Meteor.call('attachments.remove', attachment._id);
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
</style>