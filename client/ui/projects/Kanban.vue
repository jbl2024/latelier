<template>
  <div class="kanban" @click="hideProperties()">
      <div v-for="list in lists" :key='list._id'>
        <drop @drop="(data, event) => { handleDrop(list, data, event) }">
        <div class="swimlane">
          <drag :transfer-data="getTransferData(list)">
          <h2 v-show="!isListEdited(list, selectedList)" >
            <span @click="editList(list)" class="list-name">{{list.order}} - {{list.name}}</span>
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

          <div slot="image" class="drag-image">
              <h2><span class="list-name">{{list.name}}</span></h2>
          </div>          

        </drag>

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
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'

export default {
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
    }
  },
  meteor: {
    lists () {
      return Lists.find({projectId: this.projectId}, {sort: {order: 1}});
    }
  },
  methods: {
    hideProperties () {
      this.$events.fire('close-properties');
    },
    handleDrop(list, data, event) {
      if (data.type === 'task') {
        var droppedTask = data.data;
        Meteor.call('tasks.move', list.projectId, list._id, droppedTask._id, -1);
        return false;
      } else if (data.type === 'list') {
        var order = list.order - 1;
        var target = event.toElement;
        var middle = target.clientWidth / 2;
        if (event.offsetX >= middle) {
          order = list.order + 1;
        }
        var droppedList = data.data;
        Meteor.call('lists.move', list.projectId, droppedList._id, order);
        return false;
      }
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
      Meteor.call('tasks.insert', this.projectId, listId, 'Nouvelle tache', (error, task) => { 
        if (error) {
          return;
        }
        this.$events.fire('task-edit-name', task);
      });
    },

    getTransferData (list) {
      return {
        type: 'list',
        data: list
      };
    }
  }
}
</script>

<style scoped>


.swimlane {
  flex: 0 0 auto;
  width: 272px;
  min-height: 800px;
  display: inline-block;
  margin-right: 8px;
}

.drag {

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