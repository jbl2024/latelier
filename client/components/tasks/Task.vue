<template>
  <div
    class="task"
    @click="selectTask"
    @mouseenter="showEditButton = true"
    @mouseleave="showEditButton = false"
  >
    <drag
      class="drag"
      :transfer-data="getTransferData(task)"
      @dragstart="onDragStart"
      @dragend="onDragEnd"
    >
      <drop @drop="handleDrop" @dragover="handleDragOver" @dragleave="handleDragLeave">
        <div
          class="card"
          ref="card"
          :class="{ dragover, dragup, dragdown, selected }"
          v-show="!hidden"
        >
          <div class="header">
            <div class="checkbox">
              <div class="pretty p-svg p-curve">
                <input
                  type="checkbox"
                  v-show="!editName"
                  v-model="task.completed"
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
            <div class="avatar">
              <v-avatar size="32" :class="isOnline(task.assignedTo)" v-show="task.assignedTo">
                <span>{{ formatUserLetters(task.assignedTo) }}</span>
              </v-avatar>
            </div>
          </div>
          <v-divider></v-divider>
          <task-labels-in-card class="labels" :task="task"></task-labels-in-card>
          <div class="title">
            <v-icon
              icon
              flat
              v-show="showEditButton && !editName"
              class="editButton"
              small
              color="grey darken-1"
              @click="startUpdateName"
            >edit</v-icon>
            <div class="title-wrapper">
              <div v-show="!editName" :class="getClassForName(task)">{{ task.name }}</div>

              <span v-show="editName" class="edit">
                <input
                  ref="name"
                  @focus="$event.target.select()"
                  type="text"
                  class="edit-name"
                  v-model="task.name"
                  v-on:keyup.enter="updateName()"
                >
                <v-btn icon flat @click.native="updateName">
                  <v-icon>check_circle</v-icon>
                </v-btn>

                <v-btn icon flat @click.native="cancelUpdateName">
                  <v-icon>cancel</v-icon>
                </v-btn>
              </span>
            </div>
          </div>

          <v-divider v-if="hasAdditionalContentToShow(task)"></v-divider>
          <task-checklist :task="task" :hide-if-empty="true" class="checklist"></task-checklist>
          <v-divider v-if="hasFooterData(task)"></v-divider>
          <div class="footer" v-if="hasFooterData(task)">
            <div v-if="task.dueDate" class="due-date">
              <v-icon class="alarm-icon">alarm_on</v-icon>
              {{ formatDate(task.dueDate) }}
            </div>
          </div>
        </div>
      </drop>
    </drag>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Attachments } from "/imports/api/attachments/attachments";
import { mapState } from "vuex";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import moment from "moment";

export default {
  mixins: [usersMixin],
  mounted() {
    this.$events.listen("task-edit-name", task => {
      if (task._id !== this.task._id) {
        return;
      }
      this.startUpdateName();
    });
    this.$events.listen("task-cancel-edit-name", task => {
      if (task._id !== this.task._id) {
        this.cancelUpdateName();
      }
    });
    this.$events.listen("task-selected", task => {
      if (!task || task._id !== this.task._id) {
        this.selected = false;
        return;
      }
      this.selected = true;
    });
  },
  beforeDestroy() {
    this.$events.off("task-edit-name");
    this.$events.off("task-cancel-edit-name");
    this.$events.off("task-selected");
  },
  props: {
    task: {
      type: Object
    }
  },
  computed: {
    ...mapState(["currentOrganizationId"])
  },
  data() {
    return {
      editName: false,
      savedName: "",
      dragover: false,
      dragup: false,
      dragdown: false,
      selected: false,
      hidden: false,
      showEditButton: false
    };
  },
  watch: {
    "task.completed"(completed, prevValue) {
      if (prevValue != completed) {
        Meteor.call("tasks.complete", this.task._id, completed);
      }
    }
  },
  methods: {
    getTransferData(task) {
      return {
        type: "task",
        data: task
      };
    },

    onDragStart() {
      this.hidden = true;
    },

    onDragEnd() {
      this.hidden = false;
    },

    handleDrop(data, event) {
      event.stopPropagation();
      this.dragover = false;
      this.dragup = false;
      this.dragdown = false;

      if (!data) {
        this.onDropFile(this.task, event);
        return;
      }

      if (data.type === "task") {
        var order = this.task.order;
        var droppedTask = data.data;
        var target = event.toElement || event.target;
        var middle = target.clientHeight / 2;
        if (event.offsetY < middle) {
          order = order - 1;
        }
        Meteor.call(
          "tasks.move",
          this.task.projectId,
          this.task.listId,
          droppedTask._id,
          order
        );
        return false;
      } else if (data.type === "list") {
        var list = Lists.findOne({ _id: this.task.listId });
        var order = list.order - 1;
        var target = event.toElement || event.target;
        var middle = target.clientWidth / 2;
        if (event.offsetX >= middle) {
          order = list.order + 1;
        }
        var droppedList = data.data;
        Meteor.call("lists.move", list.projectId, droppedList._id, order);
        return false;
      }
    },

    handleDragOver(data, event) {
      if (!data) {
        return;
      }
      if (data.type === "task") {
        if (data.data._id == this.task._id) {
          this.dragover = false;
          return;
        }
        var target = event.toElement || event.target;
        var middle = target.clientHeight / 2;
        if (event.offsetY >= middle) {
          this.dragup = false;
          this.dragdown = true;
        } else {
          this.dragup = true;
          this.dragdown = false;
        }
      }
      this.dragover = true;
    },
    handleDragLeave(data, event) {
      this.dragover = false;
      this.dragup = false;
      this.dragdown = false;
    },

    onDropFile(task, event) {
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
      if (files.length == 0) {
        return;
      }

      const taskName = files[0].name;

      files.map(file => {
        const upload = Attachments.insert(
          {
            file: file,
            streams: "dynamic",
            chunkSize: "dynamic",
            meta: {
              projectId: task.projectId,
              taskId: task._id,
              createdBy: Meteor.userId()
            }
          },
          false
        );

        upload.on("start", function() {});

        upload.on("end", function(error, fileObj) {
          if (error) {
            alert("Error during upload: " + error);
          } else {
            Meteor.call("tasks.track", {
              type: "tasks.addAttachment",
              taskId: task._id
            });
          }
        });

        upload.start();
      });
      this.removeDragData(event);
    },

    removeDragData(event) {
      if (event.dataTransfer.items) {
        // Use DataTransferItemList interface to remove the drag data
        event.dataTransfer.items.clear();
      } else {
        // Use DataTransfer interface to remove the drag data
        event.dataTransfer.clearData();
      }
    },

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
            return;
          }
        }
      );
    },

    cancelUpdateName(e) {
      if (e) {
        e.stopPropagation();
      }
      this.editName = false;
    },

    formatDate(date) {
      return moment(date).format("DD/MM/YYYY HH:mm");
    },

    selectTask(e) {
      e.stopPropagation();
      if (this.editName) {
        return;
      }
      this.$router.push({
        name: "project-task",
        params: {
          organizationId: this.currentOrganizationId,
          projectId: this.task.projectId,
          taskId: this.task._id
        }
      });
    },
    formatDate(date) {
      return moment(date).format("DD/MM/YYYY HH:mm");
    },

    getClassForName(task) {
      var classes = ["name"];

      if (task.completed) {
        classes.push("completed");
      }
      return classes.join(" ");
    },

    hasAdditionalContentToShow(task) {
      if (task.assignedTo) {
        return true;
      }
      if (task.checklist && task.checklist.length > 0) {
        return true;
      }
      if (task.dueDate) {
        return true;
      }
      return false;
    },

    hasFooterData (task) {
      return task.dueDate;
    }
  }
};
</script>

<style scoped>
.card {
  background-color: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  transition: box-shadow 0.5s ease;
  position: relative;
}

.card:hover {
  box-shadow: 0px 8px 8px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

.header {
  background-color: #4A5EAF;
  border-radius: 4px 4px 0px 0px;
  height: 52px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
}

.checkbox {
  margin-left: 12px;
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

.task h2 {
  text-align: left;
  background-color: #2d6293;
  color: white;
  font-weight: normal;
  font-size: 14px;
  padding: 5px;
  padding-top: 12px;
  padding-bottom: 12px;
  margin-bottom: 0;
}

.dragup {
  background: linear-gradient(0deg, #fff 50%, #eee 50%);
}

.dragdown {
  background: linear-gradient(0deg, #eee 50%, #fff 50%);
}

.selected {
  background: linear-gradient(90deg, #aaa 2%, #fff 2%);
}

.title {
  position: relative;
}

.title-wrapper {
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 12px;
  padding-right: 12px;

  display: flex;
}

.name {
  flex: auto;
  font-size: 12px;
  padding-right: 22px;
}

.task {
  padding-left: 2px;
  padding-right: 2px;
  padding-bottom: 12px;
}

.name.completed {
  text-decoration: line-through;
}

.edit {
  margin-left: 4px;
  margin-top: 4px;
}
.edit .v-btn {
  min-width: 24px;
  width: 24px;
  height: 20px;
  margin: 0;
  margin-top: 4px;
}

.edit-name {
  font-size: 14px;
  font-family: Roboto, Noto Sans, -apple-system, BlinkMacSystemFont, sans-serif;
  width: 75%;
  margin-left: -3px;
}

.checklist {
  margin-left: 12px;
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
  margin-right: 12px;
}
.avatar .v-avatar {
  /* box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); */
}

.alarm-icon {
  position: relative;
  top: 4px;
}

.editButton {
  overflow: hidden;
  position: absolute;
  right: 8px;
  top: 8px;
}
</style>