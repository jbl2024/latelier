<template>

  <div class="task-detail">
    <v-toolbar dense>
        <v-btn icon flat @click="requestClose()" v-shortkey="['esc']" @shortkey="requestClose()">
          <v-icon>close</v-icon>
        </v-btn>
      <v-toolbar-title>
        <span>{{ task.name}}</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu bottom left class="menu">
        <v-btn slot="activator" icon>
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile @click="deleteTask(task._id)">
            <v-list-tile-title>Supprimer</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>

    <task-labels :task="task"></task-labels>
    <div>
      <author-line :user-id="task.createdBy" :date="task.createdAt"></author-line>
    </div>

    <v-divider></v-divider>
    <div class="description">
      <div v-show="!editDescription && task.description && task.description.length > 0" @click="startEditDescription">
        <div v-html="markDown(task.description)"></div>
      </div>
      <div v-show="!task.description && !editDescription" @click="startEditDescription">
        Aucune description
      </div>

      <div v-show="editDescription">
        <v-textarea ref="description" solo label=Description v-model="task.description" @keyup.ctrl.enter="updateDescription"></v-textarea>
        <v-btn icon flat @click="updateDescription">
          <v-icon>check_circle</v-icon>
        </v-btn>

        <v-btn icon flat @click="cancelUpdateDescription">
          <v-icon>cancel</v-icon>
        </v-btn>
      </div>
    </div>
    <v-divider></v-divider>

    <v-tabs grow>
      <v-tab id="tab-properties">
        Propriétés
      </v-tab>
      <v-tab id="tab-notes">
        {{ getLabel('Notes', notesCount) }}
      </v-tab>
      <v-tab id="tab-checklist">
        {{ getLabel('Checklist', checklistCount) }}
      </v-tab>
      <v-tab id="tab-resources">
        {{ getLabel('Ressources', resourcesCount) }}
      </v-tab>

      <v-tab-item>
        <task-properties :task="task"></task-properties>
      </v-tab-item>
      <v-tab-item>
        <task-notes :task="task"></task-notes>
      </v-tab-item>
      <v-tab-item>
        <task-checklist-in-detail :task="task"></task-checklist-in-detail>
      </v-tab-item>
      <v-tab-item>
        <task-resources :task="task"></task-resources>
      </v-tab-item>
    </v-tabs> 

  </div>

</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import MarkdownMixin from "/imports/ui/mixins/MarkdownMixin.js";

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
      params() {
        return {
          id: this.taskId
        };
      },
      deep: false,
      update({ id }) {
        return Tasks.findOne({ _id: id }) || {};
      }
    },

    checklistCount: {
      params() {
        return {
          id: this.taskId
        };
      },
      update({ id }) {
        const task = Tasks.findOne({ _id: id }) || {};
        const checklist = task.checklist || [];
        return checklist.length;
      }
    },

    notesCount: {
      params() {
        return {
          id: this.taskId
        };
      },
      update({ id }) {
        const task = Tasks.findOne({ _id: id }) || {};
        const notes = task.notes || [];
        return notes.length;
      }
    },

    resourcesCount: {
      params() {
        return {
          id: this.taskId
        };
      },
      update({ id }) {
        const task = Tasks.findOne({ _id: id }) || {};
        const resources = task.resources || [];
        return resources.length;
      }
    }
  },
  methods: {
    requestClose() {
      this.$events.fire("close-task-detail");
    },
    deleteTask(taskId) {
      Meteor.call("tasks.remove", taskId);
      this.$events.fire("close-task-detail");
    },
    startEditDescription() {
      this.savedDescription = this.task.description;
      this.editDescription = true;
      this.$nextTick(() => this.$refs.description.focus());
    },

    updateDescription() {
      this.editDescription = false;
      Meteor.call(
        "tasks.updateDescription",
        this.task._id,
        this.task.description
      );
    },

    cancelUpdateDescription() {
      this.editDescription = false;
      this.task.description = this.savedDescription;
    },

    getLabel(label, count) {
      if (!count || count == 0) {
        return label;
      }
      return label + " (" + count + ")";
    }
  }
};
</script>

<style scoped>
.menu {
  z-index: 10000;
}
.description {
  margin: 24px;
}

.task-labels {
  margin-top: 12px;
  margin-left: 12px;
}

.author-line {
  margin: 24px;
}

pre {
  font-family: Roboto, Noto Sans, -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: pre-wrap;
}

</style>