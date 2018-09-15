<template>

<div class="task" @click="selectTask">
    <drop @drop="handleDrop" @dragover="handleDragOver" @dragleave="handleDragLeave">
    <md-card md-with-hover ref="card" :class="{ dragover, dragup, dragdown, selected }">
      <md-card-area md-inset>
      <md-card-header>

        <div class="md-title">
          <div class="checkbox">
            <input type="checkbox" v-show="!editName" v-model="task.completed" @click="e => e.stopPropagation()">
          </div>
          <span v-show="!editName" @click="startUpdateName" :class="getClassForName(task)">
          {{ task.name }}
          </span>

          <span v-show="editName" class="edit">
            <input ref="name" @focus="$event.target.select()" type="text" class="edit-name" v-model="task.name" v-on:keyup.enter="updateName()">
            <md-button class="md-icon-button" @click.native="updateName">
              <md-icon>check_circle</md-icon>
            </md-button>

            <md-button class="md-icon-button" @click.native="cancelUpdateName">
              <md-icon>cancel</md-icon>
            </md-button>

          </span>

        </div>
      </md-card-header>

      </md-card-area>

      <md-card-content>

        <div class="metadata">
          <span>
            <md-avatar class="md-avatar-icon md-small" :class="isOnline(task.assignedTo)" v-show="task.assignedTo">
                <md-ripple>{{ formatUserLetters(task.assignedTo) }}</md-ripple>
            </md-avatar>
          </span>
          <span v-show="task.dueDate"><md-icon>alarm_on</md-icon>{{ formatDate(task.dueDate) }}</span>
        </div>

        <task-checklist :task="task" :hide-if-empty="true"></task-checklist>
      </md-card-content>
    </md-card>
    </drop>
</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import usersMixin from '/imports/ui/mixins/UsersMixin.js';
import moment from 'moment';

export default {
  mixins: [usersMixin],
  mounted () {
    this.$events.listen('task-edit-name', task => {
      if (task._id !== this.task._id) {
        return;
      }
      this.startUpdateName();
    });
    this.$events.listen('task-cancel-edit-name', task => {
      if (task._id !== this.task._id) {
        this.cancelUpdateName();
      }
    });
    this.$events.listen('task-selected', task => {
      if (!task || task._id !== this.task._id) {
        this.selected = false;
        return;
      }
      this.selected = true;
    });
  },
  beforeDestroy() {
    this.$events.off('task-edit-name');
    this.$events.off('task-cancel-edit-name');
    this.$events.off('task-selected');
  },
  props: {
    task: {
      type: Object
    }
  },
  data() {
    return {
      editName: false,
      savedName: '',
      dragover: false,
      dragup: false,
      dragdown: false,
      selected: false
    };
  },
  watch: {
    'task.completed'(completed, prevValue) {
      if (prevValue != completed) {
        Meteor.call('tasks.complete', this.task._id, completed);
      }
    }
  },
  methods: {
    handleDrop(data, event) {
      event.stopPropagation();
      this.dragover = false;
      this.dragup = false;
      this.dragdown = false;
      if (data.type === 'task') {
        var order = this.task.order;
        var droppedTask = data.data;
        var target = event.toElement || event.target;
        var middle = target.clientHeight / 2;
        if (event.offsetY < middle) {
          order = order - 1;
        }
        Meteor.call('tasks.move', this.task.projectId, this.task.listId, droppedTask._id, order);
        return false;
      } else if (data.type === 'list') {
        var list = Lists.findOne({_id: this.task.listId});
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

    handleDragOver (data, event) {
      if (data.type === 'task') {
        if (data.data._id == this.task._id) {
          this.dragover = false;
          return;
        }
        var target = event.toElement || event.target;
        var middle = target.clientHeight / 2;
        if (event.offsetY >= middle) {
          this.dragup = false;
          this.dragdown = true;
        } else {
          this.dragup = true;
          this.dragdown = false;
        }
      }
      this.dragover = true;
    },
    handleDragLeave (data, event) {
      this.dragover = false;
      this.dragup = false;
      this.dragdown = false;
    },

    startUpdateName (e) {
      if (e) {
        e.stopPropagation();
      }
      this.$events.fire('task-cancel-edit-name', this.task);
      this.savedName = this.task.name;
      this.editName = true;
      this.$nextTick(() => this.$refs.name.focus())
    },

    updateName (e) {
      if (e) {
        e.stopPropagation();
      }
      this.editName = false;
      if (this.task.name.length == 0) {
        this.task.name = this.savedName;
      }
      Meteor.call('tasks.updateName', this.task._id, this.task.name, (error, result) => { 
        if (error) {
          return;
        }
      });      
    },

    cancelUpdateName (e) {
      if (e) {
        e.stopPropagation();
      }
      this.editName = false;
    },

    formatDate (date) {
      return moment(date).format('DD/MM/YYYY HH:mm');
    },

    selectTask (e) {
      e.stopPropagation();
      if (this.editName) {
        return;
      }
      this.$events.fire('task-selected', this.task);
    },
    formatDate (date) {
      return moment(date).format('DD/MM/YYYY HH:mm');
    },

    getClassForName (task) {
      var classes = [
        'name'
      ];

      if (task.completed) {
        classes.push('completed');
      }
      return classes.join(' ');
    }


  }
};
</script>

<style scoped>
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



.dragup {
  background: linear-gradient(0deg, #fff 50%, #eee 50%);
}

.dragdown {
  background: linear-gradient(0deg, #eee 50%, #fff 50%);
}

.selected { 
  background: linear-gradient(90deg, #aaa 2%, #fff 2%);
}

.checkbox {
  float: left;
  margin-top: 2px;
}
.checkbox input {
  width: 16px;
  height: 16px;
}

.name {
  font-size: 12px;
}

.task {
  padding-right: 2px;
}

.name.completed {
  text-decoration: line-through;
}

.md-title:hover {
  background-color: #ddd;
  cursor: pointer;
  color: black;
  transition: background-color 250ms linear;
}

.edit .md-button {
  min-width: 24px;
  width: 24px;
  height: 20px;
  margin: 0;
  margin-top: 8px;
}

.edit-name {
  font-size: 14px;
  font-family: Roboto,Noto Sans,-apple-system,BlinkMacSystemFont,sans-serif;
  width: 75%;
  margin-left: -3px;
}

.task .md-card-header {
  padding: 12px;
}

.task .md-title {
  margin-top: 0 !important;
  font-size: 14px;
}

.task-checklist {
  font-size: 12px;
  padding-left: 0px;
  padding-top: 8px;
}

.metadata {
  margin-top: 2px;
  margin-bottom: 2px;
}

.md-card-content {
  padding-left: 12px;
  padding-top: 8px;
}

</style>