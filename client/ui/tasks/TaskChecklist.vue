<template>

<div class="task-checklist">
  <div v-for="item in checklist" :key="item._id" class="item">
    <md-checkbox v-model="item.checked" class="md-primary" @change="toggleCheckItem(item)">{{ item.name}}</md-checkbox>
    <md-button class="md-icon-button delete-button" @click="deleteItem(item)">
      <md-icon>delete</md-icon>
    </md-button>
  </div>
  <md-field>
    <md-icon>check_box_outline_blank</md-icon>
    <label>Nouvel item</label>
    <md-input v-model="item" ref="newItem" @keyup.enter="addItem"></md-input>
  </md-field>
</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import moment from 'moment';
import 'moment/locale/fr'

export default {
  name: 'task-checklist',
  props: {
    task: {
      type: Object
    }
  },
  watch: { 
    task: {
    immediate: true,
    handler: function(task, oldTask) { // watch it
        this.checklist = task.checklist;
      }
    }
  },
  data() {
    return {
      editNewItem: false,
      item: '',
      checklist: []
    };
  },
  methods: {

    hasItems (checklist) {
      return checklist && checklist.length > 0;
    },

    startNewItem () {
      this.editNewItem = true;
      this.item = '';
      this.$nextTick(() => this.$refs.newItem.$el.focus());
    },

    addItem () {
      this.editNewItem = false;
      Meteor.call('tasks.addChecklistItem', this.task._id, this.item, (error, result) => { 
        if (error) {
          return;
        }
        this.item = '';
        var task = Tasks.findOne({_id: this.task._id});
        this.checklist = task.checklist;
      });
    },

    deleteItem (item) {
      Meteor.call('tasks.removeChecklistItem', this.task._id, item._id, (error, result) => { 
        if (error) {
          return;
        }
        var task = Tasks.findOne({_id: this.task._id});
        this.checklist = task.checklist;
      });
    },

    toggleCheckItem (item) {
      Meteor.call('tasks.toggleCheckItem', this.task._id,  item._id, item.checked, (error, result) => { 
        if (error) {
          return;
        }
        var task = Tasks.findOne({_id: this.task._id});
        this.checklist = task.checklist;
      });
    },

    updateChecklist() {
      Meteor.call('tasks.updateChecklist', this.task._id, this.task.checklist, (error, result) => { 
        if (error) {
          return;
        }
        var task = Tasks.findOne({_id: this.task._id});
        this.checklist = task.checklist;
      });
    },

    cancelAddItem () {
      this.editNewItem = false;
    }
  }
};
</script>

<style scoped>

.delete-button {
  float: right;
  margin-top: 8px;
}

.task-checklist {
  margin-left: 12px;
  margin-right: 12px;
}

pre {
  font-family: Roboto,Noto Sans,-apple-system,BlinkMacSystemFont,sans-serif;
  white-space: pre-wrap;
}

.delete-button {
}

.md-empty-state {
  transition: none;
}

.note {
  margin: 8px;
}

.metadata {
  display: flex;
  flex-direction: row;
}

.metadata .author-line {
  display: inline-block;
  flex: 1;
}
.metadata .action {
  display: inline-block;
}

.metadata .action .md-button {
  margin-top: -10px;
  padding-top: 0;
}

.center {
  text-align: center;
}



</style>