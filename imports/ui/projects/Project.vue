<template>
  <div class="project">
    <div v-if="!$subReady.project">
      Loading...
    </div>
    <div v-if="$subReady.project">


      <h1 class="md-title">
        <router-link :to="{ name: 'home'}">Accueil</router-link> > {{ project.name }}
      </h1>

      <div class="container">
        <div v-for="list in lists" :key='list._id'>
          <div class="swimlane">
            <h2 v-show="!isListEdited(list, selectedList)">
              <span @click="editList(list)">{{list.name}}</span>
              <md-menu md-size="medium" md-align-trigger class="settings" :mdCloseOnClick="true" :mdCloseOnSelect="true">
                <md-button md-menu-trigger class="md-icon-button">
                  <md-icon>arrow_drop_down</md-icon>
                </md-button>
                <md-menu-content>
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

          </div>


        </div>  
        <div class="swimlane new" @click="newListInline">
          <h2>Nouvelle liste</h2>
        </div>
      </div>


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
  props: {
    projectId: {
      type: String,
      default: '0'
    }
  },
  data () {
    return {
      selectedList: {
        type: Object
      },
      savedName: {
        type: String
      }
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
      return Lists.find();
    }
  },
  methods: {

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
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.swimlane {
  flex: 0 0 auto;
  width: 200px;
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
  transition: color 0.5s ease;
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

</style>