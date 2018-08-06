<template>
  <div class="list">
    <div class="list-header">
    <drop @drop="(data, event) => { handleDrop(list, data, event) }">
    <div class="swimlane">
      <drag :transfer-data="getTransferData(list)">
      <h2 v-show="!isListEdited(list, selectedList)" >
        <span @click="editList(list)" class="list-name">{{list.name}} ({{ taskCount }}) </span>
        <md-menu md-size="medium" md-align-trigger class="settings" :mdCloseOnClick="true" :mdCloseOnSelect="true">
          <md-button md-menu-trigger class="md-icon-button">
            <md-icon>arrow_drop_down</md-icon>
          </md-button>
          <md-menu-content>
            <md-menu-item @click="newTaskInline(list._id)">Nouvelle tache</md-menu-item>
            <md-menu-item @click="deleteList(list._id)">Supprimer</md-menu-item>
            <md-divider></md-divider>
            <md-menu-item><md-checkbox v-model="list.autoComplete">Marquer comme terminé</md-checkbox></md-menu-item>
          </md-menu-content>
        </md-menu>
        <md-button md-menu-trigger class="md-icon-button settings" @click="newTaskInline(list._id)">
          <md-icon>add</md-icon>
        </md-button>

      </h2>
      <h2 v-show="isListEdited(list, selectedList)">
        <input @focus="$event.target.select()" type="text" ref="name" v-model="list.name" v-on:keyup.enter="updateName(list)">
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
    </div>
    </drop>

    </div>
      <div class="tasks-wrapper">
        <tasks :project-id="list.projectId" :list-id="list._id"></tasks>
        <div class="task new" @click="newTaskInline(list._id)">
            <h2>Ajouter une tache</h2>
        </div>
      </div>

    </div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'

export default {
  props: {
    list: {
      type: Object,
    }
  },
  data () {
    return {
      selectedList: {},
      savedName: '',
    }
  },
  watch: {
    'list.autoComplete'(autoComplete, prevValue) {
      if (prevValue != autoComplete) {
        Meteor.call('lists.autoComplete', this.list._id, autoComplete);
      }
    }
  },
  meteor: {
    taskCount () {
      return Tasks.find({listId: this.list._id}).count();
    }
  },
  methods: {
    handleDrop(list, data, event) {
      if (data.type === 'task') {
        var droppedTask = data.data;
        Meteor.call('tasks.move', list.projectId, list._id, droppedTask._id, -1);
        return false;
      } else if (data.type === 'list') {
        var order = list.order - 1;
        var target = event.toElement || event.target;
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
      this.$nextTick(() => this.$refs.name.focus())
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
      Meteor.call('lists.insert', this.list.projectId, 'Nouvelle liste', (error, createdList) => { 
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
      Meteor.call('tasks.insert', this.list.projectId, listId, 'Nouvelle tache', (error, task) => { 
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
    width: 272px;
    display: inline-block;
    margin-right: 8px;
  }

  .tasks-wrapper {
    width: 272px;    
  }
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
  background-color: #01579b;
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
  font-size: 14px;
  padding: 4px;
  font-weight: normal;
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

.list {
  display: flex;
  flex-direction: column;
}

.tasks-wrapper {
  overflow-y: scroll;
}

.tasks {
  overflow-y: auto;
  overflow-x: hidden;
}

</style>