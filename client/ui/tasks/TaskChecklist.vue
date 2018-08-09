<template>

<div class="task-checklist" v-show="showList(task.checklist)">
  <div v-for="item in task.checklist" :key="item._id" class="item" @mouseover="showButtons = true" @mouseleave="showButtons = false">
    <div v-show="!showButtons">
      <md-checkbox v-model="item.checked" class="md-primary" @change="toggleCheckItem(item)">{{ item.name}}</md-checkbox>
    </div>

    <div v-show="showButtons">
      <md-checkbox v-model="item.checked" class="md-primary check" @change="toggleCheckItem(item)">{{ item.name}}</md-checkbox>
      <div class="right">
        <md-button class="md-icon-button md-dense" @click="event => { convertToTask(event, item)}">
          <md-icon>view_week</md-icon>
        </md-button>
        <md-button class="md-icon-button md-dense" @click="event => { deleteItem(event, item)}">
          <md-icon>delete</md-icon>
        </md-button>
      </div>
      <div class="clear"></div>
    </div>

  </div>
  <md-field class="add-item">
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
    hideIfEmpty: {
      type: Boolean,
      value: false
    },
    task: {
      type: Object
    }
  },
  data() {
    return {
      editNewItem: false,
      item: '',
      showButtons: false
    };
  },
  methods: {
    showList (checklist) {
      if (this.hideIfEmpty && !this.hasItems(checklist)) {
        return false;
      }
      return true;
    },

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
      Meteor.call('tasks.addChecklistItem', this.task._id, this.item);
    },

    deleteItem (e, item) {
      if (e) {
        e.stopPropagation();
      }
      Meteor.call('tasks.removeChecklistItem', this.task._id, item._id);
    },

    toggleCheckItem (item) {
      Meteor.call('tasks.toggleCheckItem', this.task._id,  item._id, item.checked);
    },

    updateChecklist() {
      Meteor.call('tasks.updateChecklist', this.task._id, this.task.checklist);
    },

    cancelAddItem () {
      this.editNewItem = false;
    },

    convertToTask (e, item) {
      if (e) {
        e.stopPropagation();
      }

      Meteor.call('tasks.convertItemToTask', this.task._id, item._id);
    }
  }
};
</script>

<style scoped>

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}



.item {
  min-width:250px;
}

.check {
  float: left;
  white-space: nowrap;
  overflow: hidden;
  max-width: 50%;
  box-sizing:border-box;
  text-overflow: ellipsis;
}


.right {
  float: right;
  white-space: nowrap;
  max-width: 50%;
  overflow: hidden;
  box-sizing:border-box;
  text-overflow: ellipsis;
}

.clear {
  clear: both;
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

.add-item {
  margin-left: -2px;
}

.add-item label {
  font-size: 13px;
}
.add-item .md-input {
  font-size: 12px;
}

.md-checkbox {
  margin-top: 6px;
  margin-bottom: 6px;
}

</style>