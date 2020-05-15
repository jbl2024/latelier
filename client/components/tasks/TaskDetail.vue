<template>
  <v-card>
    <div class="task-detail">
      <select-project
        v-model="showSelectProjectToClone"
        @select="cloneToProject"
      />
      <!-- Standard Title -->
      <v-toolbar flat class="default-toolbar">
        <v-btn
          v-shortkey="['esc']"
          icon
          text
          @click="requestClose()"
          @shortkey="requestClose()"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title class="default-toolbar-title">
          <div class="checkbox">
            <div class="pretty p-svg p-curve">
              <input v-model="completed" type="checkbox">
              <div class="state p-primary">
                <svg class="svg svg-icon" viewBox="0 0 20 20">
                  <!-- eslint-disable -->
                  <path
                    d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z"
                    style="stroke: white;fill:white;"
                  ></path>
                  <!-- eslint-enable -->
                </svg>
                <label />
              </div>
            </div>
          </div>
          <span
            @click="startEditTaskName"
            v-html="toolbarTaskTitle"
          />
        </v-toolbar-title>
        <v-spacer />
        <task-menu
          v-if="!editTaskName"
          :task="task"
          @start-clone-to-project="showSelectProjectToClone = true"
        />
      </v-toolbar>
      <!-- Task Labels -->
      <template v-if="!hideLabels">
        <v-divider />
        <task-labels :task="task" />
      </template>
      <v-divider />
      <!-- Editing the task name -->
      <div v-show="!editTaskName" class="name" @click="startEditTaskName">
        <span v-html="linkifyHtml(task.name)" />
      </div>
      <div v-show="editTaskName" class="toolbar">
        <div class="title edit toolbar-title">
          <v-textarea
            ref="name"
            v-model="task.name"
            class="edit-name"
            autofocus
            hide-details
            outlined
            solo
            auto-grow
            @keydown.shift.enter="updateTaskName"
          />
          <v-btn icon @click="updateTaskName">
            <v-icon color="green">
              mdi-check-circle
            </v-icon>
          </v-btn>
          <v-btn icon @click="cancelUpdateTaskName">
            <v-icon color="red">
              mdi-close-circle
            </v-icon>
          </v-btn>
        </div>
      </div>
      <v-divider />
      <div class="description">
        <div
          v-show="
            !editDescription && task.description && task.description.length > 0
          "
          @click="startEditDescription"
        >
          <div class="tiptap-editor-view" v-html="linkifyHtml(task.description)" />
        </div>
        <div
          v-show="!task.description && !editDescription"
          @click="startEditDescription"
        >
          {{ $t("No description") }}
        </div>

        <div v-if="editDescription">
          <rich-editor
            ref="description"
            v-model="task.description"
            @submit="updateDescription"
            @click-outside="updateDescription"
          />
          <v-btn icon text @click="updateDescription">
            <v-icon color="green">
              mdi-check-circle
            </v-icon>
          </v-btn>

          <v-btn icon text @click="cancelUpdateDescription">
            <v-icon color="red">
              mdi-close-circle
            </v-icon>
          </v-btn>
        </div>
      </div>
      <v-divider />
      <v-tabs grow show-arrows>
        <v-tabs-slider color="accent" />
        <v-tab id="tab-properties">
          {{ $t("Properties") }}
        </v-tab>
        <v-tab id="tab-notes">
          <v-badge
            color="green"
            offset-x="-1"
            :value="notesCount > 0"
            :content="notesCount"
          >
            {{ $t("Conversation") }}
          </v-badge>
        </v-tab>
        <v-tab id="tab-checklist">
          <v-badge
            color="green"
            offset-x="-1"
            :value="checklistCount > 0"
            :content="checklistCount"
          >
            {{ $t("List") }}
          </v-badge>
        </v-tab>
        <v-tab id="tab-attachments">
          <v-badge
            color="green"
            :value="attachmentsCount > 0"
            :content="attachmentsCount"
          >
            {{ $t("Attachments") }}
          </v-badge>
        </v-tab>
        <v-tab-item :transition="false" :reverse-transition="false">
          <task-properties :task="task" :task-object="taskObject" />
        </v-tab-item>
        <v-tab-item :transition="false" :reverse-transition="false">
          <task-notes :task="task" />
        </v-tab-item>
        <v-tab-item :transition="false" :reverse-transition="false">
          <task-checklist-in-detail :task="task" />
        </v-tab-item>
        <v-tab-item :transition="false" :reverse-transition="false">
          <task-attachments :task="task" />
        </v-tab-item>
      </v-tabs>
    </div>
  </v-card>
</template>

<script>
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
      type: String,
      default: ""
    },
    taskObject: {
      type: Object,
      default: () => {}
    },
    showTaskDetail: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      editDescription: false,
      editTaskName: false,
      savedDescription: "",
      savedName: "",
      completed: false,
      showSelectProjectToClone: false
    };
  },
  computed: {
    toolbarTaskTitle() {
      return `
        #${this.task.number} - 
        ${this.task.name ? this.linkifyHtml(this.task.name) : ""}
      `;
    },
    hideLabels() {
      if (this.taskObject && this.taskObject.project) return true;
      return false;
    }
  },
  watch: {
    completed(completed) {
      if (this.task && this.task.completed !== completed) {
        Meteor.call("tasks.complete", this.taskId, completed);
      }
    }
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
        if (this.editDescription) {
          this.updateDescription();
        }
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
        return Attachments.find({ "meta.taskId": task._id }).count();
      }
    }
  },
  methods: {
    requestClose() {
      this.$store.dispatch("showTaskDetail", false);
    },
    startEditDescription() {
      this.savedDescription = this.task.description;
      this.editDescription = true;
      this.$nextTick(() => this.$refs.description.focus());
    },

    updateDescription() {
      this.editDescription = false;
      if (this.task.description != null) {
        Meteor.call(
          "tasks.updateDescription",
          this.task._id,
          this.task.description
        );
      }
    },

    cancelUpdateDescription() {
      this.editDescription = false;
      this.task.description = this.savedDescription;
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
        (error) => {
          if (error) {
            this.$notifyError(error);
            this.task.name = this.savedName;
          }
        }
      );
    },

    cancelUpdateTaskName() {
      this.editTaskName = false;
      this.task.name = this.savedName;
    },
    cloneToProject(project) {
      if (!project) return;

      this.$confirm(
        this.$t("cloneToProject.confirmation", { project: project.name }),
        {
          title: this.$t("Confirm"),
          cancelText: this.$t("Cancel"),
          confirmText: this.$t("Clone")
        }
      ).then((res) => {
        if (res) {
          Meteor.call(
            "tasks.clone",
            this.taskId,
            this.task.name,
            project._id,
            (error) => {
              if (error) {
                this.$notifyError(error);
                return;
              }
              this.$store.dispatch(
                "notify",
                this.$t("cloneToProject.done", { project: project.name })
              );
            }
          );
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
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
.default-toolbar {

  .v-toolbar__content>.v-btn.v-btn--icon:first-child+.v-toolbar__title,
  .default-toolbar-title {
    padding: 0;
    display: flex;
    align-items: center;
  }
}
.toolbar-title {
  margin: 1rem;
  flex: 2;
  font-size: 18px;
}

.menu {
  z-index: 10000;
}
.name,
.description {
  margin: 12px;
}

.task-labels {
  margin-top: 12px;
  margin-left: 12px;
}

.authors {
  margin: 12px 24px;
}

.project-link {
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
