<template>
  <div class="kanban" @click="e => hideProperties(e)" v-dragscroll="scrollEnabled" @mousemove="onMouseMove" >
      <div v-for="list in lists" :key='list._id' class="flex dragscroll">
        <list :list="list"></list>
      </div>  
      <div class="swimlane dragscroll new">
        <h2 @click="newListInline">Nouvelle liste</h2>
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
      scrollEnabled: false
    }
  },
  meteor: {
    lists () {
      return Lists.find({projectId: this.projectId}, {sort: {order: 1}});
    }
  },
  methods: {
    hideProperties (e) {
      this.$events.fire('close-task-detail');
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

    onMouseMove (e) {
      if (e && e.target && e.target.classList.contains('dragscroll')) {
        this.scrollEnabled = true;
      } else {
        this.scrollEnabled = false;
      }
    }
  }
}
</script>

<style scoped>

.flex {
  display: flex;
  flex-direction: column;
}

.swimlane.new h2 {
  font-weight: normal;
  font-size: 14px;
  padding: 5px;
  padding-top: 12px;
  margin-bottom: 0;
  border: 2px dashed #2D6293;
  background-color: white;
  padding-bottom: 8px;
  color: black;
  cursor: pointer;
}

@media (min-width: 601px) {
  .swimlane.new {
    flex: 0 0 auto;
    width: 272px;
    display: inline-block;
    margin-right: 8px;
  }
}

.swimlane.new h2:hover {
  color: rgb(48, 48, 48);
  cursor: pointer;
}

.list {
  overflow-y: scroll;  
}

</style>