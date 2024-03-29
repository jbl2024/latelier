<template>
  <div class="list" @drop="onDrop" @dragover="onDragOver">
    <new-task :project-id="list.projectId" :list-id="list._id" :active.sync="showNewTaskDialog" />
    <div class="list-header">
      <div class="swimlane dragscroll">
        <div
          v-show="!isListEdited(list, selectedList)"
          :style="getColor"
          class="flex-container-row list-name-wrapper"
        >
          <div v-if="hiddenTaskCount == 0" class="list-name flex1" @click="editList(list)">
            {{ list.name }} ({{ taskCount }})
            {{ getEstimations(tasksForEstimation) }}
          </div>
          <div
            v-if="hiddenTaskCount > 0"
            class="list-name flex1"
            @click="editList(list)"
          >
            {{ list.name }} ({{ hiddenTaskCount }}/{{ taskCount }})
          </div>
          <v-menu bottom left class="flex0">
            <template v-slot:activator="{ on }">
              <v-btn :dark="dark" small icon v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item @click="list.autoComplete = !list.autoComplete">
                <v-list-item-action>
                  <v-checkbox color="accent" :input-value="list.autoComplete" />
                </v-list-item-action>
                <v-list-item-title>{{ $t("Automatically mark as completed") }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="list.catchCompleted = !list.catchCompleted">
                <v-list-item-action>
                  <v-checkbox color="accent" :input-value="list.catchCompleted" />
                </v-list-item-action>
                <v-list-item-title>{{ $t("Catch completed tasks") }}</v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item @click="deleteList(list._id)">
                <v-list-item-action>
                  <v-icon>mdi-delete</v-icon>
                </v-list-item-action>
                <v-list-item-title>{{ $t("Delete") }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
        <div v-show="isListEdited(list, selectedList)" class="list-edit flex-container-row">
          <input
            ref="name"
            v-model="list.name"
            type="text"
            class="flex1"
            @keyup.esc="cancelUpdate(list)"
            @keyup.enter="updateName(list)"
          >
          <div class="flex0">
            <div class="flex-container-row">
              <v-btn text icon @click.native="updateName(list)">
                <v-icon color="green">
                  mdi-check-circle
                </v-icon>
              </v-btn>
              <v-btn text icon @click.native="cancelUpdate(list)">
                <v-icon color="red">
                  mdi-close-circle
                </v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="tasks-wrapper dragscroll">
      <v-btn
        v-if="canAddTask(list)"
        small
        block
        class="add-new-task dragscroll"
        @click="newTaskInline(list._id)"
      >
        {{ $t("Add new task") }}
      </v-btn>
      <div
        v-if="hiddenTaskCount > 0 && !forceShowHiddenTask"
        class="task show-hidden"
        @click="showHiddenTasks = !showHiddenTasks"
      >
        <div class="list-title">
          {{ showHiddenTasksText }}
        </div>
      </div>
      <tasks
        :project-id="list.projectId"
        :list-id="list._id"
        :show-hidden-tasks="forceShowHiddenTask ? true : showHiddenTasks"
      />
    </div>
  </div>
</template>

<script>
import { Projects, ProjectStates } from "/imports/api/projects/projects.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Attachments } from "/imports/api/attachments/attachments";
import { colors } from "/imports/colors";
import { mapState, mapGetters } from "vuex";

export default {
  props: {
    list: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      selectedList: {},
      savedName: "",
      forceShowHiddenTask: false,
      showHiddenTasks: false,
      showNewTaskDialog: false
    };
  },
  computed: {
    ...mapState("project", ["currentProjectId"]),
    ...mapGetters("project", ["hasProjectFeature"]),
    projectColor() {
      const project = Projects.findOne({ _id: this.currentProjectId });
      if (project && project.color) {
        return project.color;
      }
      return null;
    },
    showHiddenTasksText() {
      return this.showHiddenTasks
        ? `Masquer les ${this.hiddenTaskCount} tâches terminées`
        : `Afficher les ${this.hiddenTaskCount} tâches terminées`;
    },
    getColor() {
      if (this.projectColor) {
        return `
          background-color: ${this.projectColor};
          color: ${colors.getLabelColor(this.projectColor)}
        `;
      }
      return `
          background-color: #2D6293;
          color: white;
        `;
    },
    dark() {
      if (this.projectColor) {
        return colors.isDark(this.projectColor);
      }
      return true;
    }
  },
  watch: {
    "list.autoComplete"(autoComplete, prevValue) {
      if (prevValue !== autoComplete) {
        Meteor.call("lists.autoComplete", this.list._id, autoComplete);
      }
    },
    "list.catchCompleted"(catchCompleted, prevValue) {
      if (prevValue !== catchCompleted) {
        Meteor.call("lists.catchCompleted", this.list._id, catchCompleted);
      }
    }
  },
  mounted() {
    this.$events.listen("edit-list", (listId) => {
      if (listId === this.list._id) {
        this.editList(this.list);
      }
    });
    this.$events.listen("filter-tasks", (name) => {
      this.forceShowHiddenTask = Boolean(name && name.length > 0);
    });
  },
  beforeDestroy() {
    this.$events.off("filter-tasks");
    this.$events.off("edit-list");
  },
  meteor: {
    taskCount() {
      return Tasks.find({ listId: this.list._id }).count();
    },
    tasksForEstimation() {
      return Tasks.find({
        listId: this.list._id,
        estimation: { $exists: true }
      });
    },
    hiddenTaskCount() {
      return Tasks.find({ listId: this.list._id, completed: true }).count();
    }
  },
  methods: {
    editList(list) {
      this.selectedList = list;
      this.savedName = this.selectedList.name;
      this.$nextTick(() => this.$refs.name.focus());
    },

    isListEdited(list, selectedList) {
      if (!list || !selectedList) {
        this.$emit("is-edited", false);
        return false;
      }
      const edited = list._id === selectedList._id;
      this.$emit("is-edited", edited);
      return edited;
    },

    updateName(list) {
      if (list.name.length === 0) {
        list.name = this.savedName;
      }
      this.selectedList = null;
      Meteor.call("lists.updateName", list._id, list.name, (error) => {
        if (error) {
          this.$notifyError(error);
        }
      });
    },

    cancelUpdate(list) {
      list.name = this.savedName;
      this.selectedList = null;
    },

    deleteList(listId) {
      this.$confirm(this.$t("Delete list?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call("lists.remove", listId, (error) => {
            if (error) {
              this.$notifyError(error);
            }
          });
        }
      });
    },
    newTaskInline() {
      this.showNewTaskDialog = true;
    },

    getTransferData(list) {
      return {
        type: "list",
        data: list
      };
    },
    getEstimations(tasks) {
      if (!this.hasProjectFeature("estimation")) {
        return null;
      }

      if (!tasks || tasks.length === 0) {
        return null;
      }
      let size = 0;
      let spent = 0;
      tasks.forEach((task) => {
        if (task?.estimation?.size) {
          size += parseInt(task.estimation.size, 10);
        }
        if (task?.estimation?.spent) {
          spent += parseInt(task.estimation.spent, 10);
        }
      });
      return `(${size}/${spent})`;
    },

    onDrop(event) {
      event.preventDefault();

      if (Meteor.settings.public.disableAttachments) {
        return;
      }

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

      const taskName = files[0].name;
      const transport = Meteor.settings.public.uploadTransport || "ddp";
      Meteor.call(
        "tasks.insert",
        this.list.projectId,
        this.list._id,
        taskName,
        (error, task) => {
          if (error) {
            return;
          }
          files.forEach((file) => {
            const upload = Attachments.insert(
              {
                file: file,
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
            upload.on("end", function(uploadError) {
              if (error) {
                this.$notifyError(uploadError);
              } else {
                Meteor.call("tasks.addAttachment", task._id);
              }
            });
            upload.start();
          });
        }
      );
    },

    canAddTask(list) {
      const project = Projects.findOne({ _id: list.projectId });
      if (!project) {
        return false;
      }
      return project.state !== ProjectStates.ARCHIVED;
    },

    onDragOver(e) {
      e.preventDefault();
    }
  }
};
</script>

<style lang="scss" scoped>
@import "/imports/ui/styles/mixins/scrollbar";

@include scrollbar;

@media (max-width: 600px) {
  .swimlane {
    flex: 0 0 auto;
    width: 100%;
    display: inline-block;
    margin-right: 8px;
  }
  .tasks-wrapper {
    width: 100%;
    margin-top: 4px;
  }
}

@media (min-width: 601px) {
  .swimlane {
    flex: 0 0 auto;
    width: 100%;
    display: inline-block;
    margin-right: 8px;
  }

  .tasks-wrapper {
    width: 100%;
    overflow-y: auto;
    flex: 1;
    position: absolute;
    top: 44px;
    left: 0;
    right: 0;
    bottom: 0;
  }
}

.add-new-task {
  margin-bottom: 12px;
}

.swimlane.new .list-title {
  border: 2px dashed #2d6293;
  background-color: white;
  padding-bottom: 8px;
  color: black;
  cursor: pointer;
}
.swimlane.new h2:hover {
  color: rgb(48, 48, 48);
  cursor: pointer;
}

.swimlane .list-title {
  text-align: left;
  background-color: #2d6293;
  color: white;
  font-weight: normal;
  font-size: 14px;
  padding: 12px 5px;
  margin-bottom: 0;
}
.swimlane input {
  width: 70%;
}

.task.new .list-title {
  border: 1px solid #eee;
  font-size: 12px;
  padding: 8px;
  width: 100%;
  font-weight: normal;
  color: #777;
  cursor: pointer;
  background-color: white;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  transition: box-shadow 0.5s ease, opacity 0.5s ease;
}
.task.new .list-title:hover {
  color: rgb(48, 48, 48);
  cursor: pointer;
}

.task.show-hidden {
  font-size: 12px;
  padding: 4px;
  margin-bottom: 12px;
  width: 100%;
  font-weight: normal;
  color: #777;
  cursor: pointer;
  background-color: #e5e5e5;
  border-radius: 2px;
}

@media (max-width: 600px) {
  .task.new .list-title {
    width: auto;
  }
}

.list-name-wrapper {
  border-radius: 4px;
  padding: 4px 8px;
  margin-bottom: 12px;
}

@media (max-width: 600px) {
  .list-name {
    width: 100%;
    display: inline-block;
    margin-left: 4px;
  }
}

.list-name:hover {
  cursor: pointer;
}

.list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  height: 100%;
}

.list-header {
  flex: 0;
}

.tasks {
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}
.list-edit {
  width: 100%;
}

.list-edit input {
  background-color: white;
  padding: 9px;
  margin-bottom: 1px;
  margin-top: 0;
}

.list-edit .v-btn {
  width: 32px;
  margin-top: 0;
  margin-left: 0;
  margin-right: 0;
  margin-bottom: 0;
}

.flex-container-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.flex0 {
  flex: 0;
}

.flex1 {
  flex: 1;
}
</style>
