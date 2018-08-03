<template>

<div class="tasks">
    <div v-for="task in tasks" :key='task._id'>
        <drag class="drag" :transfer-data="getTransferData(task)">
          <task :task="task" class="task" ></task>
          <div slot="image" class="drag-image">
              <task-image :task="task" class="task"></task-image>
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
    $subscribe: {
    },
    tasks() {
      return Tasks.find({ listId: this.listId }, {sort: {order: 1}});
    }
  },
  methods: {
    newTaskInline () {
      var that = this;
      Meteor.call('tasks.insert', this.projectId, this.listId, 'Nouvelle tache', (error, task) => { 
        if (error) {
          return;
        }
        this.$events.fire('task-edit-name', task);
      });
    },
    deleteTask (taskId) {
      Meteor.call('tasks.remove', taskId);
    },

    getTransferData (task) {
      return {
        type: 'task',
        data: task
      };
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

.drag-image .task {
  width: 272px;;
}

</style>