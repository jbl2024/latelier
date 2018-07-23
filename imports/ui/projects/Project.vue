<template>
  <div class="project">
    <div v-if="!$subReady.project">
      <md-progress-bar md-mode="indeterminate"></md-progress-bar>
    </div>
    <div v-if="$subReady.project"> 

      <md-content class="md-elevation-1 toolbar">
        <h1 class="md-title toolbar">
        <router-link :to="{ name: 'home'}">Accueil</router-link> > {{ project.name }}
        </h1>
        <md-button class="md-icon-button settings">
          <md-icon>more_vert</md-icon>
        </md-button>

      </md-content>
      <div class="container" @click="showProperties=false">

        <div v-for="list in lists" :key='list._id'>
          <drop @drop="(data, event) => { handleDrop(list, data, event) }">
          <div class="swimlane">
            <h2 v-show="!isListEdited(list, selectedList)" >
              <span @click="editList(list)" class="list-name">{{list.name}}</span>
              <md-button md-menu-trigger class="md-icon-button" @click="newTaskInline(list._id)">
                <md-icon>add</md-icon>
              </md-button>
              <md-menu md-size="medium" md-align-trigger class="settings" :mdCloseOnClick="true" :mdCloseOnSelect="true">
                <md-button md-menu-trigger class="md-icon-button">
                  <md-icon>arrow_drop_down</md-icon>
                </md-button>
                <md-menu-content>
                  <md-menu-item @click="newTaskInline(list._id)">Nouvelle tache</md-menu-item>
                  <md-menu-item @click="deleteList(list._id)">Supprimer</md-menu-item>
                </md-menu-content>
              </md-menu>

            </h2>
            <h2 v-show="isListEdited(list, selectedList)">
              <input @focus="$event.target.select()" type="text" v-model="list.name" v-on:keyup.enter="updateName(list)">
              <md-button class="md-icon-button" @click.native="updateName(list)">
                <md-icon>check_circle</md-icon>
              </md-button>

              <md-button class="md-icon-button" @click.native="cancelUpdate(list)">
                <md-icon>cancel</md-icon>
              </md-button>

            </h2>

            <tasks :project-id="projectId" :list-id="list._id"></tasks>
            <div class="task new" @click="newTaskInline(list._id)">
                <h2>Ajouter une tache</h2>
            </div>

          </div>
          </drop>

        </div>  
        <div class="swimlane new" @click="newListInline">
          <h2>Nouvelle liste</h2>
        </div>
      </div>

      <md-drawer :md-active="showProperties" md-right md-persistent="full" class="drawer-properties">
        <task-properties :task="selectedTask"></task-properties>
      </md-drawer>

      <new-list ref="newList" :project-id="projectId"></new-list>  
      <md-speed-dial class="absolute-right">
        <md-speed-dial-target @click="newList">
          <md-icon>add</md-icon>
        </md-speed-dial-target>
      </md-speed-dial>


    </div>
  </div>    
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'

export default {
  mounted () {
    this.$events.listen('task-selected', task => {
      this.showProperties = true;
      this.selectedTask = task;
    });
    this.$events.listen('close-properties', task => {
      this.showProperties = false;
    });
  },
  beforeDestroy() {
    this.$events.off('task-selected');
    this.$events.off('close-properties');
  },
  props: {
    projectId: {
      type: String,
      default: '0'
    }
  },
  data () {
    return {
      selectedList: {},
      savedName: '',
      showProperties: false,
      selectedTask: {}
    }
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      'project': function() {
        return [this.projectId] 
      }
    },
    project () {
      return Projects.findOne();
    },
    lists () {
      return Lists.find({}, {sort: {order: 1}});
    }
  },
  methods: {
    handleDrop(list, data, event) {
      var droppedTask = data;
      Meteor.call('tasks.move', list.projectId, list._id, droppedTask._id, -1);
      return false;
    },


    editList (list) {
      this.selectedList = list;
      this.savedName = this.selectedList.name;
    },

    isListEdited (list, selectedList) {
      if (!list || !selectedList) {
        return false;
      }
      var edited = list._id === selectedList._id;
      return edited;
    },

    updateName (list) {
      if (list.name.length == 0) {
        list.name = this.savedName;
      }
      this.selectedList = null;
      Meteor.call('lists.updateName', list._id, list.name, (error, result) => { 
        if (error) {
          return;
        }
      });      
    },

    cancelUpdate (list) {
      list.name = this.savedName;
      this.selectedList = null;
    },

    newList () {
      this.$refs.newList.open();
    },

    newListInline () {
      var that = this;
      Meteor.call('lists.insert', this.projectId, 'Nouvelle liste', (error, createdList) => { 
        if (error) {
          return;
        }
        that.savedName = createdList.name;
        that.selectedList = createdList;
      });
    },
    deleteList (listId) {
      Meteor.call('lists.remove', listId);
    },
    newTaskInline (listId) {
      var that = this;
      Meteor.call('tasks.insert', this.projectId, listId, 'Nouvelle tache', (error, result) => { 
        if (error) {
          return;
        }
      });
    },
  }
}
</script>

<style scoped>

.drawer-properties {
  box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
}

.md-drawer {
  top: 66px;
  width: 600px;
}

.properties {
}

.md-content { 
  padding: 8px;
}

.toolbar {
  font-size: 18px;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.toolbar h1 {
  flex: 1;
  display: inline-block;
}

.toolbar .settings {
  margin-top: 4px;
}

.container {
  margin: 4px;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.swimlane {
  flex: 0 0 auto;
  width: 272px;
  min-height: 800px;
  display: inline-block;
  margin-right: 8px;
}

.swimlane.new h2 {
  border: 2px dashed #1f5c87;
  background-color: white;
  padding-bottom: 8px;
  color: black;
  cursor: pointer;
}
.swimlane.new h2:hover {
  color: rgb(48, 48, 48);
  cursor: pointer;
}

.md-menu-item {
  cursor: pointer;
}

.swimlane h2 {
  text-align: left;
  background-color: #1f5c87;
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

.swimlane .md-button {
  min-width: 24px;
  width: 24px;
  height: 20px;
  margin: 0;
}

.swimlane .md-icon.md-theme-default.md-icon-font {
  color: white;
}

.swimlane .settings {
  float: right;
}

.absolute-right {
  position: fixed;
  right: 24px;
  bottom: 24px;
}

.task.new h2 {
  border: 2px dashed #1f5c87;
  background-color: white;
  padding-bottom: 8px;
  color: black;
  cursor: pointer;
}
.task.new h2:hover {
  color: rgb(48, 48, 48);
  cursor: pointer;
}

.list-name {
  width: 210px;
  display: inline-block;
}

.list-name:hover {
  background-color: #323742;
  cursor: pointer;
}

</style>