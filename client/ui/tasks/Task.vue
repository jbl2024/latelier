<template>

  <div class="task" @click="selectTask" @mouseenter="showEditButton = true" @mouseleave="showEditButton = false">
    <drag class="drag" :transfer-data="getTransferData(task)" @dragstart="onDragStart" @dragend="onDragEnd">
      <drop @drop="handleDrop" @dragover="handleDragOver" @dragleave="handleDragLeave">
        <v-card ref="card" :class="{ dragover, dragup, dragdown, selected }" v-show="!hidden">
          <div>
            <task-labels-in-card class="labels" :task="task"></task-labels-in-card>
            <v-icon icon flat v-show="showEditButton && !editName" class="editButton" small color="grey darken-1" @click="startUpdateName">
              edit
            </v-icon>
            <div class="title-wrapper">
              <div class="checkbox">
                <input type="checkbox" v-show="!editName" v-model="task.completed" @click="e => e.stopPropagation()">
              </div>
              <span v-show="!editName" :class="getClassForName(task)">
                {{ task.name }}
              </span>

              <span v-show="editName" class="edit">
                <input ref="name" @focus="$event.target.select()" type="text" class="edit-name" v-model="task.name" v-on:keyup.enter="updateName()">
                <v-btn icon flat @click.native="updateName">
                  <v-icon>check_circle</v-icon>
                </v-btn>

                <v-btn icon flat @click.native="cancelUpdateName">
                  <v-icon>cancel</v-icon>
                </v-btn>

              </span>
            </div>
          </div>

          <v-divider v-show="hasAdditionalContentToShow(task)"></v-divider>
          
          <div class="card-content" v-show="hasAdditionalContentToShow(task)">
            <div class="metadata">
              <span class="avatar">
                <v-avatar size="24" :class="isOnline(task.assignedTo)" v-show="task.assignedTo">
                  <span>{{ formatUserLetters(task.assignedTo) }}</span>
                </v-avatar>
              </span>
              <span v-show="task.dueDate">
                <v-icon class="alarm-icon">alarm_on</v-icon>{{ formatDate(task.dueDate) }}
              </span>
            </div>
            <task-checklist :task="task" :hide-if-empty="true"></task-checklist>
          </div>
        </v-card>
      </drop>
    </drag>
  </div>

</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
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
      type: Object,
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
    }
  }
};
</script>

<style scoped>
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

.title-wrapper {
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 4px;
}

.checkbox {
  float: left;
  margin-top: 2px;
}
.checkbox input {
  width: 16px;
  height: 16px;
}

.name {
  font-size: 12px;
  padding-right: 22px;
}

.task {
  padding-right: 2px;
}

.v-card:hover {
  background: rgba(0,0,0,0.04);
  cursor: pointer;
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
  position: absolute;
  top: -7px;
}

.avatar {
  position: relative;
  top: -2px;
}

.alarm-icon {
  position: relative;
  top: 4px;
}

.editButton {
  overflow:hidden;
  position: absolute;
  right: 8px;
  top: 8px;
}
</style>