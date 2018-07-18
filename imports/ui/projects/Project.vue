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
          <div class="swimlane" @click="editList(list)">
            <h2 v-show="!isListEdited(list)">{{list.name}}</h2>
            <h2 v-show="isListEdited(list)"><input @focus="$event.target.select()" type="text" v-model="list.name" v-on:keyup.enter="updateName(list)"></h2>
          </div>
        </div>  
        <div class="swimlane new" @click="newListFast">
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
        type: String,
        default: '0'
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

    editList (e) {
      this.selectedList = e;
    },

    isListEdited (list) {
      if (!list || !this.selectedList) {
        return false;
      }
      return list._id === this.selectedList._id;
    },

    updateName (list) {
      this.selectedList = null;
      console.log(list.name)
      Meteor.call('lists.updateName', list._id, list.name, (error, result) => { 
        if (error) {
          return;
        }
      });      
    },

    newList () {
      this.$refs.newList.open();
    },
    newListFast () {
      Meteor.call('lists.insert', this.projectId, 'Nouvelle liste', (error, result) => { 
        if (error) {
          return;
        }
      });
    },
    deleteList (listId) {
      Meteor.call('lists.remove', listId);
    },
  },

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

.absolute-right {
  position: fixed;
  right: 24px;
  bottom: 24px;
}

</style>