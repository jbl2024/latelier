<template>

<div class="task" @click="selectTask">
    <drop @drop="handleDrop">
    <md-card md-with-hover>
      <md-card-header>
        <div class="md-title">
          
          <span v-show="!editName" @click="startUpdateName" class="name">
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
        <div class="md-subhead">{{ formatDate(task.createdAt)}}</div>
      </md-card-header>

    </md-card>
    </drop>
</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import moment from 'moment';

export default {
  mounted () {
    this.$events.listen('task-edit-name', task => {
      if (task._id !== this.task._id) {
        return;
      }
      this.startUpdateName();
    });
  },
  beforeDestroy() {
    this.$events.off('task-edit-name');
  },
  props: {
    task: {
      type: Object
    }
  },
  data() {
    return {
      editName: false,
      savedName: ''
    };
  },
  methods: {
    handleDrop(data, event) {
      event.stopPropagation();
      var droppedTask = data;
      Meteor.call('tasks.move', this.task.projectId, this.task.listId, droppedTask._id, this.task.order);
    },
    startUpdateName (e) {
      if (e) {
        e.stopPropagation();
      }
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
      e.stopPropagation();
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
    }

  }
};
</script>

<style scoped>
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


.name:hover {
  background-color: rgb(48, 48, 48);
  cursor: pointer;
  color: white;
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

</style>