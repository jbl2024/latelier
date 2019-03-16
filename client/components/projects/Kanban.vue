<template>
  <div class="kanban" @click="e => hideProperties(e)" v-dragscroll="scrollEnabled" @mousemove="onMouseMove">
      <div v-for="list in lists" :key='list._id' class="kanban-flex dragscroll">
        <list :list="list" class="kanban-list-item dragscroll" :data-id="list._id" :ref="list._id"></list>
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
import { dragscroll } from 'vue-dragscroll'

export default {
  directives: {
    'dragscroll': dragscroll
  },
  props: {
    projectId: {
      type: String,
      default: '0'
    },
    addMargin: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
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
      Meteor.call('lists.insert', this.projectId, 'Nouvelle liste', (error, createdList) => { 
        if (error) {
          return;
        }
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

.kanban-flex {
  display: flex;
  flex-direction: column;
  cursor: grab;
}

.swimlane.new h2 {
  font-weight: normal;
  font-size: 14px;
  padding: 5px;
  padding-top: 10px;
  margin-bottom: 0px;
  border: 1px dashed #2D6293;
  padding-bottom: 7px;
  color: #777;
  cursor: pointer;
}

@media (min-width: 601px) {
  .swimlane.new {
    flex: 0 0 auto;
    width: 272px;
    display: inline-block;
    margin-right: 8px;
  }
  .swimlane.task-detail-margin {
    flex: 0 0 auto;
    width: 592px;
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
@media (min-width: 601px) {
  .kanban {
    overflow-y: hidden !important;
  }

  .kanban-flex {
    border-right: 1px solid rgba(0,0,0,.12);
    margin-right: 10px;
  }
}
</style>