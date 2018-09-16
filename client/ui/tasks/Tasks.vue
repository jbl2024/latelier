<template>

<div class="tasks">
    <div v-for="task in tasks" :key='task._id'>
      <task :task="task" class="task" ></task>
    </div>
</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'


export default {
  mounted () {
    this.$events.listen('filter-tasks', name => {
      this.filterName = name;
    });
  },
  beforeDestroy() {
    this.$events.off('filter-tasks');
  },  
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
    return {
      filterName: ''
    };
  },
  meteor: {
    $subscribe: {
    },
    tasks: {
      params () {
        return {
          name: this.filterName
        };
      },
      deep: false,
      update ({name}) {
        if (name && name.length > 0) {
          return Tasks.find({ listId: this.listId, name: { $regex: ".*" + name + ".*", $options: "i" } }, {sort: {order: 1}});
        }
        return Tasks.find({ listId: this.listId}, {sort: {order: 1}});
      }
    },    
  },
  methods: {
    newTaskInline () {
      var that = this;
      Meteor.call('tasks.insert', this.projectId, this.listId, 'Nouvelle tâche', (error, task) => { 
        if (error) {
          return;
        }
        this.$events.fire('task-edit-name', task);
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
  background-color: #2D6293;
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