<template>

<div class="task-detail">
  <md-toolbar class="md-transparent" md-elevation="0">
    <div class="md-toolbar-row">
      <div class="md-toolbar-section-start">
        <md-button class="md-icon-button md-dense" @click="requestClose()" v-shortkey="['esc']" @shortkey="requestClose()">
          <md-icon>close</md-icon>
        </md-button>
        <span>{{ task.name}}</span>
      </div>
      <div class="md-toolbar-section-end">
        <md-menu md-size="medium" md-align-trigger class="settings" :mdCloseOnClick="true" :mdCloseOnSelect="true">
          <md-button md-menu-trigger class="md-icon-button">
            <md-icon>more_vert</md-icon>
          </md-button>
          <md-menu-content>
            <md-menu-item @click="deleteTask(task._id)">Supprimer</md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>
    </div>
    <task-labels :task="task"></task-labels>
    <div class="md-toolbar-row">
      <author-line :user-id="task.createdBy" :date="task.createdAt"></author-line>
    </div>

  </md-toolbar>

  <md-divider></md-divider>
  <div class="description">
    <div v-show="!editDescription && task.description && task.description.length > 0" @click="startEditDescription">
      <div v-html="markDown(task.description)"></div>
    </div>
    <div v-show="!task.description && !editDescription" @click="startEditDescription">
      Aucune description
    </div>

    <div v-show="editDescription">
      <md-field>
        <label>Description</label>
        <md-textarea ref="description" v-model="task.description" @keyup.ctrl.enter="updateDescription"></md-textarea>
      </md-field>
      <md-button class="md-icon-button" @click.native="updateDescription">
        <md-icon>check_circle</md-icon>
      </md-button>

      <md-button class="md-icon-button" @click.native="cancelUpdateDescription">
        <md-icon>cancel</md-icon>
      </md-button>

    </div>
    
  </div>
  <md-divider></md-divider>

  <md-tabs md-sync-route  md-alignment="fixed">
    <md-tab id="tab-notes" md-label="Notes">
      <task-notes :task="task"></task-notes>
    </md-tab>

    <md-tab id="tab-properties" md-label="Propriétés">
      <task-properties :task="task"></task-properties>
    </md-tab>

    <md-tab id="tab-checklist" md-label="Checklist">
      <task-checklist :task="task"></task-checklist>
    </md-tab>

  </md-tabs>  
</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import MarkdownMixin from '/imports/ui/mixins/MarkdownMixin.js'

export default {
  mixins: [MarkdownMixin],
  props: {
    taskId: {
      type: String
    },
    showTaskDetail: {
      type: Boolean
    }
  },
  data() {
    return {
      editDescription: false
    };
  },
  meteor: {
    task: {
      params () {
        return {
          id: this.taskId
        };
      },
      deep: false,
      update ({id}) {
        return Tasks.findOne({ _id: id}) || {};
      }
    }
  },
  methods: {
    requestClose () {
      this.$events.fire('close-task-detail');
    },
    deleteTask (taskId) {
      Meteor.call('tasks.remove', taskId);
      this.$events.fire('close-task-detail');
    },
    startEditDescription () {
      this.savedDescription = this.task.description;
      this.editDescription = true;
      this.$nextTick(() => this.$refs.description.$el.focus());
    },

    updateDescription () {
      this.editDescription = false;
      Meteor.call('tasks.updateDescription', this.task._id, this.task.description);
    },

    cancelUpdateDescription () {
      this.editDescription = false;
      this.task.description = this.savedDescription;
    }
  }
};
</script>

<style scoped>

.description{
  margin: 24px;
}

.md-tab{
  margin-left: 0;
  margin-right: 0;
  padding-left: 0;
  padding-right: 0;
}

.task-notes {
  margin-left: 0;
  margin-right: 0;
}

.task-checklist {
  margin-left: 12px;
  margin-right: 12px;
}

pre {
  font-family: Roboto,Noto Sans,-apple-system,BlinkMacSystemFont,sans-serif;
  white-space: pre-wrap;
}
</style>