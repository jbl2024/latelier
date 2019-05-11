<template>
  <div
    class="task"
    @click="selectTask"
    @mouseenter="showEditButton = true"
    @mouseleave="showEditButton = false"
  >
    <div
      class="card"
      ref="card"
      :class="{ selected, completed }"
    >
      <task-labels-in-card class="labels" :task="task"></task-labels-in-card>
      <div class="title">
        <v-icon
          icon
          flat
          v-show="showEditButton && !editName"
          class="edit-button"
          small
          color="grey darken-1"
          @click.stop="startUpdateName"
        >edit</v-icon>
        <v-icon
          icon
          flat
          v-show="showEditButton && !editName"
          class="delete-button"
          small
          color="grey darken-1"
          @click.stop="deleteTask"
        >delete</v-icon>

        <div class="title-wrapper">
          <div class="checkbox" v-if="!editName">
            <div class="pretty p-svg p-curve">
              <input
                type="checkbox"
                v-show="!editName"
                v-model="completed"
                @click="e => e.stopPropagation()"
              >
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
          <div v-show="!editName" :class="getClassForName(task)" v-html="linkifyHtml(task.name)"></div>
          <v-icon
            class="has-notes"
            small
            color="blue darken-1"
            v-show="hasNotes(task) && !editName"
          >chat</v-icon>

          <span v-show="editName" class="edit">
            <v-textarea
              ref="name"
              class="edit-name"
              @focus.native="$event.target.select()"
              label="Titre de la tâche"
              outline
              v-model="task.name"
              @keyup.ctrl.enter="updateName"
            ></v-textarea>
            <v-btn icon flat @click.native="updateName">
              <v-icon>check_circle</v-icon>
            </v-btn>

            <v-btn icon flat @click.native="cancelUpdateName">
              <v-icon>cancel</v-icon>
            </v-btn>
          </span>
        </div>
      </div>
      <v-divider v-if="hasChecklist(task)"></v-divider>
      <task-checklist :task="task" :hide-if-empty="true" class="checklist"></task-checklist>

      <div class="completed-date" v-if="task.completedAt">
        {{ $t('Completed on') }}
        {{ formatDateTime(task.completedAt) }}
      </div>

      <v-divider v-if="hasFooterData(task)"></v-divider>
      <div class="footer" v-if="hasFooterData(task)">
        <div class="due-date">
          <template v-if="task.dueDate">
            <v-icon class="alarm-icon">alarm_on</v-icon>
            {{ formatDateTime(task.dueDate) }}
          </template>
        </div>
        <div class="avatar">
          <v-avatar size="24" :class="isOnline(task.assignedTo)" v-show="task.assignedTo">
            <span>{{ formatUserLetters(task.assignedTo) }}</span>
          </v-avatar>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Attachments } from "/imports/api/attachments/attachments";
import { mapState } from "vuex";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

import moment from "moment";

export default {
  mixins: [usersMixin, TextRenderingMixin, DatesMixin],
  mounted() {
    this.$events.listen("task-edit-name", task => {
      if (task._id !== this.task._id) {
        return;
      }
      this.startUpdateName();
    });
    this.$events.listen("task-edit-name-after-creation", task => {
      if (task._id !== this.task._id) {
        return;
      }
      this.justCreated = true;
      this.startUpdateName();
    });
    this.$events.listen("task-cancel-edit-name", task => {
      if (task._id !== this.task._id) {
        this.cancelUpdateName();
      }
    });
  },
  beforeDestroy() {
    this.$events.off("task-edit-name");
    this.$events.off("task-cancel-edit-name");
  },
  props: {
    task: {
      type: Object
    }
  },
  computed: {
    ...mapState(["currentProjectId"]),
    selected: {
      get() {
        return (
          this.$store.state.selectedTask &&
          this.$store.state.selectedTask._id === this.task._id
        );
      }
    }
  },
  data() {
    return {
      editName: false,
      savedName: "",
      showEditButton: false,
      completed: false,
      showConfirmDeleteDialog: false,
      justCreated: false
    };
  },
  watch: {
    "task.completed": {
      immediate: true,
      handler(completed, prevValue) {
        if (this.completed != completed) {
          this.completed = completed;
        }
      }
    },
    completed(completed) {
      Meteor.call("tasks.complete", this.task._id, completed);
    }
  },
  methods: {
    startUpdateName(e) {
      if (e) {
        e.stopPropagation();
      }
      this.$events.fire("task-cancel-edit-name", this.task);
      this.savedName = this.task.name;
      this.editName = true;
      this.$nextTick(() => this.$refs.name.focus());
    },

    updateName(e) {
      if (e) {
        e.stopPropagation();
      }
      this.editName = false;
      if (this.task.name.length == 0) {
        this.task.name = this.savedName;
      }
      Meteor.call(
        "tasks.updateName",
        this.task._id,
        this.task.name,
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            if (this.justCreated) {
              Meteor.call("tasks.remove", this.task._id);
            }
            return;
          }
          this.justCreated = false;
        }
      );
    },

    cancelUpdateName(e) {
      if (e) {
        e.stopPropagation();
      }
      this.editName = false;
      if (this.justCreated) {
        Meteor.call("tasks.remove", this.task._id);
      }
    },

    selectTask(e) {
      e.stopPropagation();
      if (this.editName) {
        return;
      }
      this.$router.push({
        name: "project-task",
        params: {
          projectId: this.task.projectId,
          taskId: this.task._id
        }
      });
    },
    getClassForName(task) {
      var classes = ["name"];

      if (this.completed) {
        classes.push("completed");
      }
      return classes.join(" ");
    },

    hasChecklist(task) {
      if (task.checklist && task.checklist.length > 0) {
        return true;
      }
      return false;
    },

    hasNotes(task) {
      if (task.notes && task.notes.length > 0) {
        return true;
      }
      return false;
    },

    hasFooterData(task) {
      return task.dueDate || task.assignedTo;
    },

    getColor(projectId) {
      const project = Projects.findOne({ _id: projectId });
      if (project && project.color) {
        return "background-color: " + project.color;
      } else {
        return "background-color: #2D6293";
      }
    },

    deleteTask() {
      this.$events.fire("delete-task", this.task);
    }
  }
};
</script>

<style scoped>
.card {
  background-color: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  transition: box-shadow 0.5s ease, opacity 0.5s ease,
    background-color 0.5s ease;
  position: relative;
}

.card.completed {
  opacity: 0.6;
}

.card:hover {
  box-shadow: 0px 8px 8px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

.footer {
  border-radius: 0px 0px 4px 4px;
  height: 52px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.due-date {
  margin-left: 12px;
  color: #666;
  font-size: 11px;
}

.completed-date {
  margin-left: 12px;
  padding-bottom: 12px;
  color: #666;
  font-size: 11px;
}

.dragup {
  background: linear-gradient(0deg, #fff 50%, #eee 50%);
}

.dragdown {
  background: linear-gradient(0deg, #eee 50%, #fff 50%);
}

.selected {
  background-color: #c5cae9;
}
.pretty .state label:before {
  background-color: white;
}

.title {
  position: relative;
}

.title-wrapper {
  padding-top: 24px;
  padding-bottom: 24px;
  padding-left: 12px;
  padding-right: 12px;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
}

.checkbox {
  font-size: 13px;
  flex-grow: 0;
  flex-shrink: 0;
  margin-top: 2px;
}

.name {
  font-size: 12px;
  padding-right: 22px;
  line-height: 1.3;
  flex-grow: 1;
}

.task {
  padding-left: 2px;
  padding-right: 2px;
  padding-bottom: 12px;
}

.edit {
  width: 100%;
}

.edit .v-btn {
  min-width: 24px;
  width: 24px;
  height: 20px;
  margin: 0;
  margin-top: 4px;
}

.edit-name {
  /* font-size: 12px;
  font-family: Roboto, Noto Sans, -apple-system, BlinkMacSystemFont, sans-serif; */
}

.checklist {
  margin-left: 12px;
  padding-bottom: 12px;
}

.task-checklist {
  font-size: 12px;
  padding-left: 0px;
  padding-top: 8px;
}

.metadata {
  padding-top: 8px;
  margin-top: 2px;
  margin-bottom: 2px;
  font-size: 12px;
}

.card-content {
  padding-left: 12px;
  padding-top: 8px;
  margin-bottom: 0;
  padding-bottom: 8px;
}

.labels {
}

.avatar {
  font-size: 11px;
  margin-top: 5px;
  margin-right: 12px;
}
.avatar .v-avatar {
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}

.alarm-icon {
  position: relative;
  top: 4px;
}

.edit-button {
  overflow: hidden;
  position: absolute;
  right: 8px;
  top: 4px;
}

.delete-button {
  overflow: hidden;
  position: absolute;
  right: 8px;
  top: 40px;
}

.has-notes {
  position: absolute;
  right: 8px;
  top: 24px;
}

.very-small {
  width: 30px;
  height: 30px;
}
</style>