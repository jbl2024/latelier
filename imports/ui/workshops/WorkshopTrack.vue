/* eslint max-len: 285 */
<template>
  <div
    v-observe-visibility="visibilityChanged"
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
      <div class="track-title">
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
          <div
            v-show="!editName"
            :class="getClassForName(track)"
            v-html="linkifyHtml(track.name)"
          />
          <v-icon
            v-show="hasAttachments(track) && !editName"
            :class="getClassForAttachment(track)"
            small
            color="blue darken-1"
          >
            mdi-paperclip
          </v-icon>
          <v-icon
            v-show="hasNotes(track) && !editName"
            class="has-notes"
            small
            color="blue darken-1"
          >
            mdi-message-text
          </v-icon>

          <span v-show="editName" class="edit">
            <v-textarea
              ref="name"
              v-model="track.name"
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
    track: {
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
      showConfirmDeleteDialog: false,
      isVisible: false
    };
  },
  computed: {
    ...mapState(["currentProjectId"]),
    selected: {
      get() {
        return (
          this.$store.state.selectedTask
          && this.$store.state.selectedTask._id === this.track._id
        );
      }
    },
    isLate: {
      get() {
        return (
          this.track
          && this.track.dueDate
          && this.track.dueDate <= new Date()
          && !this.track.completed
        );
      }
    }
  },
  watch: {
    "track.completed": {
      immediate: true,
      handler(completed) {
        if (this.completed !== completed) {
          this.completed = completed;
        }
      }
    },
    completed(completed) {
      Meteor.call("tasks.complete", this.track._id, completed);
    },
    selected(selected) {
      if (selected && !this.isVisible) {
        this.$el.scrollIntoView({
          behavior: "smooth"
        });
      }
    }
  },
  mounted() {
    this.$events.listen("task-edit-name", (track) => {
      if (track._id !== this.track._id) {
        return;
      }
      this.startUpdateName();
    });
    this.$events.listen("task-cancel-edit-name", (track) => {
      if (track._id !== this.track._id) {
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
      this.$events.fire("task-cancel-edit-name", this.track);
      this.savedName = this.track.name;
      this.editName = true;
      this.$nextTick(() => this.$refs.name.focus());
    },

    updateName(e) {
      if (e) {
        e.stopPropagation();
      }
      this.editName = false;
      if (this.track.name.length === 0) {
        this.track.name = this.savedName;
      }
      Meteor.call(
        "tasks.updateName",
        this.track._id,
        this.track.name,
        (error) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            this.track.name = this.savedName;
          }
        }
      );
    },

    cancelUpdateName(e) {
      if (e) {
        e.stopPropagation();
      }
      this.editName = false;
      this.track.name = this.savedName;
    },

    selectTask(e) {
      e.stopPropagation();
      if (this.editName) {
        return;
      }
      this.$router.push({
        name: "project-task",
        params: {
          projectId: this.track.projectId,
          taskId: this.track._id
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

    hasChecklist(track) {
      if (track.checklist && track.checklist.length > 0) {
        return true;
      }
      return false;
    },

    hasNotes(track) {
      if (track.notes && track.notes.length > 0) {
        return true;
      }
      return false;
    },

    hasAttachments(track) {
      return Attachments.find({ "meta.taskId": track._id }).count() > 0;
    },

    hasFooterData(track) {
      return track.dueDate || track.assignedTo || this.hasEstimationData(track);
    },

    hasEstimationData(track) {
      if (!this.isProjectEstimationFeatureEnabled()) {
        return false;
      }
      return track.estimation && (track.estimation.size || track.estimation.spent);
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
      this.$events.fire("delete-task", this.track);
    },

    getClassForAttachment(track) {
      return this.hasNotes(track)
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
              projectId: track.projectId,
              taskId: track._id,
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
            Meteor.call("tasks.addAttachment", track._id);
          }
        });
        upload.start();
      });
    },

    onDragOver(e) {
      e.preventDefault();
    },

    visibilityChanged(isVisible) {
      this.isVisible = isVisible;
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

.track-title {
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
