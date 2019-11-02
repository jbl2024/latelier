/* eslint max-len: 285 */
<template>
  <div
    class="task"
    tabindex="0"
    @drop="onDrop"
    @dragover="onDragOver"
    @keyup.enter="selectTask"
    @click="selectTask"
    @mouseenter="showEditButton = true"
    @mouseleave="showEditButton = false"
  >
    <div ref="card" class="card" :class="{ selected, completed }">
      <task-labels-in-card class="labels" :task="task" />
      <div class="task-title">
        <v-icon
          v-show="showEditButton && !editName"
          icon
          text
          class="edit-button"
          small
          color="grey darken-1"
          @click.stop="startUpdateName"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          v-show="showEditButton && !editName"
          icon
          text
          class="delete-button"
          small
          color="grey darken-1"
          @click.stop="deleteTask"
        >
          mdi-delete
        </v-icon>

        <div class="title-wrapper">
          <div v-if="!editName" class="checkbox">
            <div class="pretty p-svg p-curve">
              <input
                v-show="!editName"
                v-model="completed"
                type="checkbox"
                @click="(e) => e.stopPropagation()"
              >
              <div class="state p-primary">
                <svg class="svg svg-icon" viewBox="0 0 20 20">
                  <!-- eslint-disable -->
                  <path
                    d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z"
                    style="stroke: white;fill:white;"
                  />
                  <!-- eslint-enable -->
                </svg>
                <label />
              </div>
            </div>
          </div>
          <div
            v-show="!editName"
            :class="getClassForName(task)"
            v-html="linkifyHtml(task.name)"
          />
          <v-icon
            v-show="hasAttachments(task) && !editName"
            :class="getClassForAttachment(task)"
            small
            color="blue darken-1"
          >
            mdi-paperclip
          </v-icon>
          <v-icon
            v-show="hasNotes(task) && !editName"
            class="has-notes"
            small
            color="blue darken-1"
          >
            mdi-message-text
          </v-icon>

          <span v-show="editName" class="edit">
            <v-textarea
              ref="name"
              v-model="task.name"
              class="edit-name"
              background-color="white"
              autofocus
              outlined
              auto-grow
              solo
              @keyup.esc="cancelUpdateName"
              @keydown.shift.enter="updateName"
            />
            <v-btn icon text @click.native="updateName">
              <v-icon>mdi-check-circle</v-icon>
            </v-btn>

            <v-btn icon text @click.native="cancelUpdateName">
              <v-icon>mdi-close-circle</v-icon>
            </v-btn>
          </span>
        </div>
      </div>
      <v-divider v-if="hasChecklist(task)" />
      <task-checklist :task="task" :hide-if-empty="true" class="checklist" />

      <div v-if="task.completedAt" class="completed-date">
        {{ $t("Completed on") }}
        {{ formatDateTime(task.completedAt) }}
      </div>

      <v-divider v-if="hasFooterData(task)" />
      <div v-if="hasFooterData(task)" class="footer">
        <div class="footer-left">
          <template v-if="task.dueDate">
            <v-icon small :class="{ late: isLate }">
              {{ isLate ? "mdi-clock-alert-outline" : "mdi-alarm-check" }}
            </v-icon>
            {{ formatDateTime(task.dueDate) }}
          </template>
          <template v-if="isProjectEstimationFeatureEnabled()">
            <template v-if="task.estimation && task.estimation.size">
              <v-icon small>
                mdi-timer
              </v-icon>
              {{ task.estimation.size }}
            </template>
            <template v-if="task.estimation && task.estimation.spent">
              <v-icon small>
                mdi-timelapse
              </v-icon>
              {{ task.estimation.spent }}
            </template>
          </template>
        </div>
        <div class="avatar">
          <author-avatar
            v-show="task.assignedTo"
            :user-id="task.assignedTo"
            xsmall
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Attachments } from "/imports/api/attachments/attachments";
import { mapState } from "vuex";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [usersMixin, TextRenderingMixin, DatesMixin],
  props: {
    task: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      editName: false,
      savedName: "",
      showEditButton: false,
      completed: false,
      showConfirmDeleteDialog: false
    };
  },
  computed: {
    ...mapState(["currentProjectId"]),
    selected: {
      get() {
        return (
          this.$store.state.selectedTask
          && this.$store.state.selectedTask._id === this.task._id
        );
      }
    },
    isLate: {
      get() {
        return (
          this.task
          && this.task.dueDate
          && this.task.dueDate <= new Date()
          && !this.task.completed
        );
      }
    }
  },
  watch: {
    "task.completed": {
      immediate: true,
      handler(completed) {
        if (this.completed !== completed) {
          this.completed = completed;
        }
      }
    },
    completed(completed) {
      Meteor.call("tasks.complete", this.task._id, completed);
    }
  },
  mounted() {
    this.$events.listen("task-edit-name", (task) => {
      if (task._id !== this.task._id) {
        return;
      }
      this.startUpdateName();
    });
    this.$events.listen("task-cancel-edit-name", (task) => {
      if (task._id !== this.task._id) {
        this.editName = false;
      }
    });
  },
  beforeDestroy() {
    this.$events.off("task-edit-name");
    this.$events.off("task-cancel-edit-name");
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
      if (this.task.name.length === 0) {
        this.task.name = this.savedName;
      }
      Meteor.call(
        "tasks.updateName",
        this.task._id,
        this.task.name,
        (error) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            this.task.name = this.savedName;
          }
        }
      );
    },

    cancelUpdateName(e) {
      if (e) {
        e.stopPropagation();
      }
      this.editName = false;
      this.task.name = this.savedName;
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
    getClassForName() {
      const classes = ["name"];

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

    hasAttachments(task) {
      return Attachments.find({ "meta.taskId": task._id }).count() > 0;
    },

    hasFooterData(task) {
      return task.dueDate || task.assignedTo || this.hasEstimationData(task);
    },

    hasEstimationData(task) {
      if (!this.isProjectEstimationFeatureEnabled()) {
        return false;
      }
      return task.estimation && (task.estimation.size || task.estimation.spent);
    },

    isProjectEstimationFeatureEnabled() {
      return this.$store.getters.hasProjectFeature("estimation");
    },

    getColor(projectId) {
      const project = Projects.findOne({ _id: projectId });
      if (project && project.color) {
        return `background-color: ${project.color}`;
      }
      return "background-color: #2D6293";
    },

    deleteTask() {
      this.$events.fire("delete-task", this.task);
    },

    getClassForAttachment(task) {
      return this.hasNotes(task)
        ? "has-attachments-shifted"
        : "has-attachments";
    },

    onDrop(event) {
      event.preventDefault();
      const { task } = this;
      const files = [];
      if (event.dataTransfer.items) {
        for (let i = 0; i < event.dataTransfer.items.length; i++) {
          if (event.dataTransfer.items[i].kind === "file") {
            const file = event.dataTransfer.items[i].getAsFile();
            files.push(file);
          }
        }
      } else {
        for (let i = 0; i < event.dataTransfer.files.length; i++) {
          files.push(event.dataTransfer.files[i]);
        }
      }
      if (files.length === 0) {
        return;
      }
      event.stopPropagation();

      const transport = Meteor.settings.public.uploadTransport || "ddp";
      files.forEach((file) => {
        const upload = Attachments.insert(
          {
            file: file,
            streams: "dynamic",
            chunkSize: "dynamic",
            transport: transport,
            meta: {
              projectId: task.projectId,
              taskId: task._id,
              createdBy: Meteor.userId()
            }
          },
          false
        );
        upload.on("start", function() {});
        upload.on("end", function(error) {
          if (error) {
            this.$store.dispatch("notifyError", error);
          } else {
            Meteor.call("tasks.addAttachment", task._id);
          }
        });
        upload.start();
      });
    },

    onDragOver(e) {
      e.preventDefault();
    }
  }
};
</script>

<style scoped>

.task:focus {
  outline: none;
}

.task:focus .card {
  background-color: #c5cae9;
}
.card {
  background-color: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  transition: box-shadow 0.5s ease, opacity 0.5s ease,
    background-color 0.5s ease;
  position: relative;
}

.card.completed {
  opacity: 0.8;
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

.footer .v-icon {
  margin-left: 8px;
}

.footer-left {
  margin-left: 4px;
  margin-top: 8px;
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

.task-title {
  position: relative;
  font-size: 20px !important;
  font-weight: 500;
  line-height: 1 !important;
  letter-spacing: 0.02em !important;
  font-family: Roboto, sans-serif !important;
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
  font-weight: normal;
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

.avatar {
  font-size: 11px;
  margin-top: 5px;
  margin-right: 12px;
}
.avatar .v-avatar {
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
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

.has-attachments-shifted {
  position: absolute;
  right: 24px;
  top: 24px;
}

.has-attachments {
  position: absolute;
  right: 8px;
  top: 24px;
}

.very-small {
  width: 30px;
  height: 30px;
}

.late {
  color: red !important;
}
</style>
