<template>
  <div class="list">
    <drop @drop="(data, event) => { handleDrop(list, data, event) }">
      <div class="list-header">
        <div class="swimlane dragscroll">
          <drag :transfer-data="getTransferData(list)" :draggable="!isListEdited(list, selectedList)">
            <div v-show="!isListEdited(list, selectedList)" :style="getColor(currentProjectId)">
              <div :style="getColor(currentProjectId)">
                <div class="list-name" @click="editList(list)" v-if="hiddenTaskCount  == 0">{{list.name}} ({{ taskCount }})</div>
                <div class="list-name" @click="editList(list)" v-if="hiddenTaskCount > 0">{{list.name}} ({{ hiddenTaskCount}}/{{ taskCount }})</div>
                <v-menu bottom left>
                  <v-btn dark small slot="activator" icon>
                    <v-icon>more_vert</v-icon>
                  </v-btn>
                  <v-list dense>
                    <v-list-tile @click="newTaskInline(list._id)">
                      <v-list-tile-action>
                        <v-icon>add</v-icon>
                      </v-list-tile-action>
                      <v-list-tile-title>Nouvelle tâche</v-list-tile-title>
                      
                    </v-list-tile>
                    <v-list-tile @click="deleteList(list._id)">
                      <v-list-tile-action>
                        <v-icon>delete</v-icon>
                      </v-list-tile-action>
                      <v-list-tile-title>Supprimer</v-list-tile-title>
                    </v-list-tile>
                    <v-divider></v-divider>
                    <v-list-tile @click="list.autoComplete = !list.autoComplete">
                      <v-list-tile-action >
                        <v-checkbox
                          :input-value="list.autoComplete"
                        ></v-checkbox>
                      </v-list-tile-action> 
                      <v-list-tile-title>Terminer automatiquement</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click="list.catchCompleted = !list.catchCompleted">
                      <v-list-tile-action >
                        <v-checkbox
                          :input-value="list.catchCompleted"
                        ></v-checkbox>
                      </v-list-tile-action> 
                      <v-list-tile-title>Attraper les tâche terminées</v-list-tile-title>
                    </v-list-tile>
                  </v-list>
                </v-menu>
              </div>
            </div>
            <div class="list-edit" v-show="isListEdited(list, selectedList)">
              <input
                type="text"
                ref="name"
                v-model="list.name"
                v-on:keyup.enter="updateName(list)"
              >
              <v-btn flat icon @click.native="updateName(list)">
                <v-icon>check_circle</v-icon>
              </v-btn>
              <v-btn flat icon @click.native="cancelUpdate(list)">
                <v-icon>cancel</v-icon>
              </v-btn>
            </div>
          </drag>
        </div>
      </div>
      <div class="tasks-wrapper">
        <tasks :project-id="list.projectId" :list-id="list._id" :show-hidden-tasks="showHiddenTasks"></tasks>
        <v-btn small block @click="newTaskInline(list._id)">
            Ajouter une tâche
        </v-btn>
        <div class="task show-hidden" @click="showHiddenTasks = !showHiddenTasks" v-if="hiddenTaskCount > 0">
          <div class="list-title" v-if="showHiddenTasks">Masquer les {{ hiddenTaskCount }} tâches terminées</div>
          <div class="list-title" v-if="!showHiddenTasks">Afficher les {{ hiddenTaskCount }} tâches terminées</div>
        </div>
      </div>
    </drop>
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
      showHiddenTasks: false
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
    hiddenTaskCount() {
      return Tasks.find({ listId: this.list._id, completed: true }).count();
    }
  },
  methods: {
    handleDrop(list, data, event) {
      if (!data) {
        this.onDropFile(list, event);
        return;
      }
      if (data.type === "task") {
        var droppedTask = data.data;
        Meteor.call(
          "tasks.move",
          list.projectId,
          list._id,
          droppedTask._id,
          -1
        );
        return false;
      } else if (data.type === "list") {
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

    onDropFile(list, event) {
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

      Meteor.call(
        "tasks.insert",
        list.projectId,
        list._id,
        taskName,
        (error, task) => {
          if (error) {
            return;
          }
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
        }
      );
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
      Meteor.call("lists.remove", listId);
    },
    newTaskInline(listId) {
      var that = this;
      Meteor.call(
        "tasks.insert",
        this.list.projectId,
        listId,
        "",
        (error, task) => {
          if (error) {
            return;
          }
          this.$events.fire("task-edit-name-after-creation", task);
        }
      );
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
    overflow-y: scroll !important;
    flex: 1;
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .list {
    /* margin-bottom: 48px; */
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
  width: 220px;
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

.tasks-wrapper {
  overflow-y: scroll;
}

.tasks {
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.list-edit input {
  float: left;
  width: 204px;
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
</style>