<template>
  <div class="task-detail">
    <div class="toolbar">
      <div class="title edit toolbar-title" v-show="editTaskName">

        <v-textarea
          ref="name"
          class="edit-name"
          autofocus
          outlined
          solo
          auto-grow
          v-model="task.name"
          @keydown.shift.enter="updateTaskName"
        ></v-textarea>
        <v-btn icon @click="updateTaskName">
          <v-icon>mdi-check-circle</v-icon>
        </v-btn>
        <v-btn icon @click="cancelUpdateTaskName">
          <v-icon>mdi-close-circle</v-icon>
        </v-btn>
      </div>

      <div class="toolbar-button" v-if="!editTaskName">
        <v-btn icon text @click="requestClose()" v-shortkey="['esc']" @shortkey="requestClose()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="checkbox" v-if="!editTaskName">
        <div class="pretty p-svg p-curve">
          <input type="checkbox" v-show="!editTaskName" v-model="completed">
          <div class="state p-primary">
            <svg class="svg svg-icon" viewBox="0 0 20 20">
              <path
                d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z"
                style="stroke: white;fill:white;"
              ></path>
            </svg>
            <label></label>
          </div>
        </div>
      </div>

      <div class="toolbar-title" @click="startEditTaskName" v-if="!editTaskName">
        <span class="task-name" v-html="linkifyHtml(task.name)"></span>
      </div>
      <div class="toolbar-button" v-if="!editTaskName">
        <task-menu :task="task"></task-menu>
      </div>
    </div>

    <task-labels :task="task" v-if="!hideLabels"></task-labels>
    <div class="authors">
      <template v-if="showProjectLink(taskObject)">
        <div>
          <router-link :to="{ name: 'project-task', params: { projectId: taskObject.project._id, taskId: taskObject._id } }">
          [{{ taskObject.project.name}}]
          </router-link>
        </div>
      </template>
      <div class="completed-date" v-if="task.completedAt">
        {{ $t('Completed on') }}
        {{ formatDate(task.completedAt) }}
      </div>

      <v-layout row>
        <v-flex shrink>
          <div class="number">#{{ task.number }}</div>
        </v-flex>
        <v-flex>
          <author-line
            v-if="showCreatedBy(task)"
            :user-id="task.createdBy"
            :date="task.createdAt"
            class="author"
            :prefix="$t('Created by')"
          ></author-line>
          <author-line
            v-if="showUpdatedBy(task)"
            :user-id="task.updatedBy"
            :date="task.updatedAt"
            class="author"
            :prefix="$t('Last update by')"
          ></author-line>
        </v-flex>
      </v-layout>

    </div>

    <v-divider></v-divider>
    <div class="description">
      <div
        v-show="!editDescription && task.description && task.description.length > 0"
        @click="startEditDescription"
      >
        <div class="ql-editor-view" v-html="linkifyHtml(task.description)"></div>
      </div>
      <div
        v-show="!task.description && !editDescription"
        @click="startEditDescription"
      >{{ $t('No description') }}</div>

      <div v-show="editDescription">
        <rich-editor ref="description" v-model="task.description" @submit="updateDescription"></rich-editor>
        <v-btn icon text @click="updateDescription">
          <v-icon>mdi-check-circle</v-icon>
        </v-btn>

        <v-btn icon text @click="cancelUpdateDescription">
          <v-icon>mdi-close-circle</v-icon>
        </v-btn>
      </div>
    </div>
    <v-divider></v-divider>

    <v-tabs grow show-arrows>
      <v-tabs-slider color="accent"></v-tabs-slider>
      <v-tab id="tab-properties">{{ $t('Properties') }}</v-tab>
      <v-tab id="tab-notes">{{ getLabel($t('Conversation'), notesCount) }}</v-tab>
      <v-tab id="tab-checklist">{{ getLabel($t('List'), checklistCount) }}</v-tab>
      <v-tab id="tab-attachments">{{ getLabel($t('Attachments'), attachmentsCount) }}</v-tab>

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
        <task-attachments :task="task"></task-attachments>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Attachments } from "/imports/api/attachments/attachments";
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [TextRenderingMixin, DatesMixin],
  i18n: {
    messages: {
      en: {
        "Last update by": "Last update by"
      },
      fr: {
        "Last update by": "Dernière modification par"
      }
    }
  },
  props: {
    taskId: {
      type: String
    },
    taskObject: {
      type: Object
    },
    showTaskDetail: {
      type: Boolean
    }
  },
  watch: {
    completed(completed) {
      if (this.task && this.task.completed != completed) {
        Meteor.call("tasks.complete", this.taskId, completed);
      }
    }
  },
  computed: {
     hideLabels() {
       if (this.taskObject && this.taskObject.project) return true;
       return false;
    }
  },
  data() {
    return {
      editDescription: false,
      editTaskName: false,
      savedDescription: "",
      savedName: "",
      completed: false
    };
  },
  meteor: {
    $subscribe: {
      task: function() {
        return [this.taskId];
      }
    },
    task: {
      params() {
        return {
          id: this.taskId
        };
      },
      deep: false,
      update({ id }) {
        const task = Tasks.findOne({ _id: id }) || {};
        this.completed = task.completed;
        return task;
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

    attachmentsCount: {
      params() {
        return {
          id: this.taskId
        };
      },
      update({ id }) {
        const task = Tasks.findOne({ _id: id }) || {};
        return Attachments.find({'meta.taskId': task._id}).count();
      }
    },

  },
  methods: {
    requestClose() {
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
    },

    startEditTaskName() {
      this.savedName = this.task.name;
      this.editTaskName = true;
      this.$nextTick(() => this.$refs.name.focus());
    },

    updateTaskName() {
      this.editTaskName = false;
      Meteor.call(
        "tasks.updateName",
        this.task._id,
        this.task.name,
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            this.task.name = this.savedName;
            return;
          }
        }
      );
    },

    cancelUpdateTaskName() {
      this.editTaskName = false;
      this.task.name = this.savedName;
    },

    showProjectLink(task) {
      return task && task.project;
    },

    showCreatedBy(task) {
      if (!task.updatedBy) {
        return true;
      }
      if (task.createdBy === task.updatedBy) {
        const dif = task.updatedAt.getTime() - task.createdAt.getTime();
        const seconds = Math.abs(dif / 1000);
        if (seconds > 60) {
          return true;
        }
        return false;
      } else {
        return true;
      }
    },

    showUpdatedBy(task) {
      return task.updatedAt && task.updatedBy;
    }
  }
};
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.author {
  color: rgba(0, 0, 0, 0.54);
  font-size: 80%;
}

.task-name {
  cursor: text;
}
.edit-name {
  font-weight: normal;
}
.number {
  color: rgba(0, 0, 0, 0.54);
  font-size: 80%;
  margin-right: 4px;
}


.toolbar-button {
  flex: 1;
  max-width: 42px;
  margin-left: 8px;
  margin-right: 8px;
}

.toolbar-title {
  flex: 2;
  font-size: 18px;
}

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

.authors {
  margin: 24px;
  margin-bottom: 12px;
}

.completed-date {
  color: rgba(0, 0, 0, 0.54);
  font-weight: bold;
}

pre {
  font-family: Roboto, Noto Sans, -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: pre-wrap;
}
</style>