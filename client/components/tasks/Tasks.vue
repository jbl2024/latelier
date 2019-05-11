<template>

<div class="tasks">
    <div v-for="task in tasks" :key='task._id'>
      <task :task="task" class="task" v-if="showCompleted(task, showHiddenTasks)"></task>
    </div>
</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import { mapState } from 'vuex';


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
    },
    showHiddenTasks: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState("projectFilters", {
      selectedLabels: state => state.selectedLabels,
      selectedAssignedTos: state => state.selectedAssignedTos,
      selectedUpdatedBy: state => state.selectedUpdatedBy
    })
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
          name: this.filterName,
          labels: this.selectedLabels,
          assignedTos: this.selectedAssignedTos,
          updatedBy: this.selectedUpdatedBy
        };
      },
      deep: false,
      update ({name, labels, assignedTos, updatedBy}) {
        var query = {
          listId: this.listId
        };

        if (name && name.length > 0) {
          query.name = {
            $regex: ".*" + name + ".*", $options: "i"
          };
        }

        if (labels && labels.length > 0) {
          query.labels = {
            $in: labels.map(label => { return label._id})
          };
        }

        if (assignedTos && assignedTos.length > 0) {
          query.assignedTo = {
            $in: assignedTos
          };
        }

        if (updatedBy && updatedBy.length > 0) {
          query.updatedBy = {
            $in: updatedBy
          };
        }
        
        return Tasks.find(query, {sort: {order: 1}});
      }
    },    
  },
  methods: {
    showCompleted(task, show) {
      if (task.completed && !show) {
        return false;
      }
      return true;
    },

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