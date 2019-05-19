<template>
  <div class="list">
    <new-task :project-id="list.projectId" :list-id="list._id" :active.sync="showNewTaskDialog"></new-task>
    <div class="list-header">
      <div class="swimlane dragscroll">
        <div v-show="!isListEdited(list, selectedList)" :style="getColor(currentProjectId)">
          <div :style="getColor(currentProjectId)" class="flex-container-row">
            <div
              class="list-name flex1"
              @click="editList(list)"
              v-if="hiddenTaskCount  == 0"
            >{{list.name}} ({{ taskCount }}) {{ getEstimations(tasksForEstimation) }}</div>
            <div
              class="list-name flex1"
              @click="editList(list)"
              v-if="hiddenTaskCount > 0"
            >{{list.name}} ({{ hiddenTaskCount}}/{{ taskCount }})</div>
            <v-menu bottom left class="flex0">
              <v-btn dark small slot="activator" icon>
                <v-icon>more_vert</v-icon>
              </v-btn>
              <v-list dense>
                <v-list-tile @click="newTaskInline(list._id)">
                  <v-list-tile-action>
                    <v-icon>add</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-title>{{ $t('Add new task') }}</v-list-tile-title>
                </v-list-tile>
                <v-list-tile @click="deleteList(list._id)">
                  <v-list-tile-action>
                    <v-icon>delete</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-title>Supprimer</v-list-tile-title>
                </v-list-tile>
                <v-divider></v-divider>
                <v-list-tile @click="list.autoComplete = !list.autoComplete">
                  <v-list-tile-action>
                    <v-checkbox :input-value="list.autoComplete"></v-checkbox>
                  </v-list-tile-action>
                  <v-list-tile-title>Terminer automatiquement</v-list-tile-title>
                </v-list-tile>
                <v-list-tile @click="list.catchCompleted = !list.catchCompleted">
                  <v-list-tile-action>
                    <v-checkbox :input-value="list.catchCompleted"></v-checkbox>
                  </v-list-tile-action>
                  <v-list-tile-title>Attraper les tâche terminées</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </div>
        </div>
        <div class="list-edit flex-container-row" v-show="isListEdited(list, selectedList)">
          <input
            type="text"
            ref="name"
            v-model="list.name"
            class="flex1"
            v-on:keyup.enter="updateName(list)"
          >
          <div class="flex0">
            <div class="flex-container-row">
              <v-btn flat icon @click.native="updateName(list)">
                <v-icon>check_circle</v-icon>
              </v-btn>
              <v-btn flat icon @click.native="cancelUpdate(list)">
                <v-icon>cancel</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="tasks-wrapper dragscroll">
      <v-btn small block @click="newTaskInline(list._id)" class="dragscroll">{{ $t('Add new task')}}</v-btn>
      <div
        class="task show-hidden"
        @click="showHiddenTasks = !showHiddenTasks"
        v-if="hiddenTaskCount > 0"
      >
        <div
          class="list-title"
          v-if="showHiddenTasks"
        >Masquer les {{ hiddenTaskCount }} tâches terminées</div>
        <div
          class="list-title"
          v-if="!showHiddenTasks"
        >Afficher les {{ hiddenTaskCount }} tâches terminées</div>
      </div>
      <tasks :project-id="list.projectId" :list-id="list._id" :show-hidden-tasks="showHiddenTasks"></tasks>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Attachments } from "/imports/api/attachments/attachments";
import { mapState } from "vuex";

export default {
  props: {
    list: {
      type: Object
    }
  },
  computed: {
    ...mapState(["currentProjectId"])
  },
  data() {
    return {
      selectedList: {},
      savedName: "",
      showHiddenTasks: false,
      showNewTaskDialog: false
    };
  },
  watch: {
    "list.autoComplete"(autoComplete, prevValue) {
      if (prevValue != autoComplete) {
        Meteor.call("lists.autoComplete", this.list._id, autoComplete);
      }
    },
    "list.catchCompleted"(catchCompleted, prevValue) {
      if (prevValue != catchCompleted) {
        Meteor.call("lists.catchCompleted", this.list._id, catchCompleted);
      }
    }
  },
  meteor: {
    taskCount() {
      return Tasks.find({ listId: this.list._id }).count();
    },
    tasksForEstimation() {
      return Tasks.find({listId: this.list._id, estimation: {$exists: true}});
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
        return false;
      }
      var edited = list._id === selectedList._id;
      return edited;
    },

    updateName(list) {
      if (list.name.length == 0) {
        list.name = this.savedName;
      }
      this.selectedList = null;
      Meteor.call("lists.updateName", list._id, list.name, (error, result) => {
        if (error) {
          return;
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
      }).then(res => {
        if (res) {
          Meteor.call("lists.remove", listId, (error, result) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
              return;
            }
          });
        }
      });
    },
    newTaskInline(listId) {
      this.showNewTaskDialog = true;
      return;
    },

    getTransferData(list) {
      return {
        type: "list",
        data: list
      };
    },

    getColor(projectId) {
      const project = Projects.findOne({ _id: projectId });
      if (project && project.color) {
        return "background-color: " + project.color;
      } else {
        return "background-color: #2D6293";
      }
    },

    getEstimations(tasks) {
      if (!tasks || tasks.length == 0) {
        return;
      }
      let size = 0;
      let spent = 0;
      tasks.map(task => {
        if (task.estimation.size) {
          size = size + task.estimation.size 
        }
        if (task.estimation.spent) {
          spent = spent + task.estimation.spent;
        }
      })
      return `(${size}/${spent})`
    }
  }
};
</script>

<style scoped>
@media (max-width: 600px) {
  .swimlane {
    flex: 0 0 auto;
    width: 100%;
    display: inline-block;
    margin-right: 8px;
  }
  .tasks-wrapper {
    width: 100%;
  }
}

@media (min-width: 601px) {
  .swimlane {
    flex: 0 0 auto;
    width: 274px;
    display: inline-block;
    margin-right: 8px;
    padding-right: 2px;
  }

  .tasks-wrapper {
    width: 274px;
    overflow-y: auto;
    flex: 1;
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    scrollbar-width: none; /* Firefox */
  }
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
  padding: 5px;
  padding-top: 12px;
  padding-bottom: 12px;
  margin-bottom: 0;
}
.swimlane input {
  width: 70%;
}

.task.new .list-title {
  border: 1px solid #eee;
  font-size: 12px;
  padding: 8px;
  width: 272px;
  font-weight: normal;
  color: #777;
  cursor: pointer;
  background-color: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
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
  margin-top: 4px;
  width: 100%;
  font-weight: normal;
  color: #777;
  cursor: pointer;
  background-color: #e5e5e5;
}

@media (max-width: 600px) {
  .task.new .list-title {
    width: auto;
  }
}
.list-name {
  display: inline-block;
  margin-left: 4px;
  color: white;
}

@media (max-width: 600px) {
  .list-name {
    width: 280px;
    display: inline-block;
    margin-left: 4px;
    color: white;
  }
}

.list-name:hover {
  background-color: #323742;
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