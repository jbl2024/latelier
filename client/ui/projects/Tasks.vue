<template>

<div class="tasks">
    <div v-for="task in tasks" :key='task._id'>
        <drag class="drag">
          <task :task="task" class="task"></task>
          <div slot="image" class="drag-image">
              <md-card md-with-hover >
                <md-card-header>
                  <div class="md-title">{{ task.name }}</div>
                </md-card-header>
              </md-card>
          </div>          
      </drag>
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
      default: "0"
    },
    listId: {
      type: String,
      default: "0"
    }
  },
  data() {
    return {};
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      tasks: function() {
        return [this.listId];
      }
    },
    tasks() {
      return Tasks.find({ listId: this.listId });
    }
  },
  methods: {
    newTaskInline () {
      var that = this;
      Meteor.call('tasks.insert', this.projectId, this.listId, 'Nouvelle tache', (error, result) => { 
        if (error) {
          return;
        }
      });
    },
    deleteTask (taskId) {
      Meteor.call('tasks.remove', taskId);
    }
  }
};
</script>

<style scoped>

.task {
  margin-top: 6px;
  margin-bottom: 6px;
}
.task h2 {
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

</style>