<template>
  <div class="task-checklist-in-detail" v-show="showList(task.checklist)" @click.stop>
    <v-list dense>
      <template v-for="item in task.checklist">
        <v-list-tile :key="item._id">
          <v-list-tile-action>
            <v-checkbox v-model="item.checked" @change="toggleCheckItem(item)"></v-checkbox>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ item.name }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple @click="event => { convertToTask(event, item)}">
              <v-icon>list</v-icon>
            </v-btn>
          </v-list-tile-action>
          <v-list-tile-action>
            <v-btn icon ripple @click="event => { deleteItem(event, item)}">
              <v-icon>delete</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </template>
    </v-list>
    <v-text-field class="add-item"
      preprend-icon="check_box_outline_blank"
      label="Nouvel item"
      v-model="item"
      ref="newItem"
      @keyup.enter="addItem"
    ></v-text-field>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import moment from "moment";
import "moment/locale/fr";

export default {
  name: "task-checklist-in-detail",
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
      item: ""
    };
  },
  methods: {
    showList(checklist) {
      if (this.hideIfEmpty && !this.hasItems(checklist)) {
        return false;
      }
      return true;
    },

    hasItems(checklist) {
      return checklist && checklist.length > 0;
    },

    addItem() {
      this.editNewItem = false;
      Meteor.call(
        "tasks.addChecklistItem",
        this.task._id,
        this.item,
        (error, result) => {
          if (!error) {
            this.item = "";
          }
        }
      );
    },

    deleteItem(e, item) {
      if (e) {
        e.stopPropagation();
      }
      Meteor.call("tasks.removeChecklistItem", this.task._id, item._id);
    },

    toggleCheckItem(item) {
      Meteor.call(
        "tasks.toggleCheckItem",
        this.task._id,
        item._id,
        item.checked
      );
    },

    updateChecklist() {
      Meteor.call("tasks.updateChecklist", this.task._id, this.task.checklist);
    },

    cancelAddItem() {
      this.editNewItem = false;
    },

    convertToTask(e, item) {
      if (e) {
        e.stopPropagation();
      }

      Meteor.call("tasks.convertItemToTask", this.task._id, item._id);
    }
  }
};
</script>

<style scoped>
.task-checklist-in-detail {
  margin: 12px;
  padding: 12px;
  max-width: 800px;
  margin: 0 auto;
}

.icons {
  border: 2px solid black;
}

.add-item {
  margin-left: 18px;
  margin-right: 18px;
}

.add-item label {
  font-size: 13px;
}
</style>