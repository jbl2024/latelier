<template>
  <div class="task-checklist-in-detail" v-show="showList(task.checklist)" @click.stop>
    <div class="progress">
      <v-progress-linear v-model="completion"></v-progress-linear>
    </div>
    <v-list
      dense
      class="tasks-wrapper elevation-1"
      v-if="task.checklist && task.checklist.length > 0"
      v-sortable-list
      @sorted="objectSortOccurred"
    >
      <template v-for="item in task.checklist">
        <v-list-tile :key="item._id">
          <v-list-tile-action>
            <v-checkbox v-model="item.checked" @change="toggleCheckItem(item)"></v-checkbox>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              <input
                type="text"
                v-model.lazy="item.name"
                class="edit"
                v-on:change="updateItem(item)"
              >
            </v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action class="sortHandle">
            <v-icon style="cursor: row-resize">
              drag_handle
            </v-icon>
          </v-list-tile-action>
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
    <v-text-field
      class="add-item"
      preprend-icon="check_box_outline_blank"
      :label="$t('New item')"
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
import * as Sortable from "sortablejs";

export default {
  name: "task-checklist-in-detail",
  directives: {
    sortableList: {
      bind(el, binding, vnode) {
        const options = {
          handle: ".sortHandle",
          animation: 150,
          onUpdate: function(event) {
            vnode.child.$emit("sorted", event);
          }
        };
        Sortable.create(el, options);
      }
    }
  },
  props: {
    hideIfEmpty: {
      type: Boolean,
      value: false
    },
    task: {
      type: Object
    }
  },
  watch: {
    task: {
      immediate: true,
      handler(task) {
        if (!task.checklist) {
          this.completion = 0;
          return;
        }
        const totalItems = task.checklist.length;
        let completedItems = 0;
        task.checklist.map(item => {
          if (item.checked) {
            completedItems = completedItems + 1; 
          }
        })
        this.completion = 100 * (completedItems / totalItems);
      }
    }
  },
  data() {
    return {
      editNewItem: false,
      item: "",
      completion: 0
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
      this.$confirm(this.$t("Delete element?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then(res => {
        if (res) {
          Meteor.call("tasks.removeChecklistItem", this.task._id, item._id);
        }
      });

    },

    toggleCheckItem(item) {
      Meteor.call(
        "tasks.toggleCheckItem",
        this.task._id,
        item._id,
        item.checked
      );
    },

    cancelAddItem() {
      this.editNewItem = false;
    },

    convertToTask(e, item) {
      if (e) {
        e.stopPropagation();
      }
      this.$confirm(this.$t("Convert element to task?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Convert")
      }).then(res => {
        if (res) {
          Meteor.call("tasks.convertItemToTask", this.task._id, item._id);
        }
      });
    },

    updateItem(item) {
      Meteor.call("tasks.updateCheckListItem", this.task._id, item);
    },

    objectSortOccurred({ oldIndex, newIndex }) {
      const moved = this.task.checklist.splice(oldIndex, 1)[0];
      this.task.checklist.splice(newIndex, 0, moved);
      Meteor.call("tasks.updateCheckList", this.task._id, this.task.checklist);
    },
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

.tasks-wrapper {
  margin-top: 12px;
  margin-bottom: 12px;
  border-radius: 4px;
}

.icons {
  border: 2px solid black;
}

.add-item label {
  font-size: 13px;
}

.edit {
  width: 100%;
}
</style>