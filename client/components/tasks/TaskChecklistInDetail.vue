<template>
  <div class="task-checklist-in-detail" v-show="showList(task.checklist)" @click.stop>
    <div class="progress">
      <v-progress-linear v-model="completion"></v-progress-linear>
    </div>

    <v-simple-table
      class="tasks-wrapper elevation-1"
      v-if="task.checklist && task.checklist.length > 0"
    >
      <tbody v-sortable-list="objectSortOccurred">
        <tr v-for="item in task.checklist" :key="item._id">
          <td class="check">
            <div class="checkbox">
              <div class="pretty p-svg p-curve">
                <input
                  type="checkbox"
                  v-model="item.checked"
                  @change="toggleCheckItem(item)"
                  @click="e => e.stopPropagation()"
                >
                <div class="state p-primary">
                  <svg class="svg svg-icon" viewBox="0 0 20 20">
                    <path
                      d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z"
                      style="stroke: white;fill:white;"
                    ></path>
                  </svg>
                  <label></label>
                </div>
              </div>
            </div>
          </td>
          <td>
            <input type="text" v-model.lazy="item.name" class="edit" v-on:change="updateItem(item)" />
          </td>
          <td class="sortHandle text-right">
            <v-icon style="cursor: row-resize">mdi-drag-vertical</v-icon>
            <v-btn small icon ripple @click="event => { deleteItem(event, item)}">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-simple-table>

    <v-text-field
      class="add-item"
      preprend-icon="mdi-checkbox-blank-outline"
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
            binding.value(event);
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
        });
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

.checkbox {
  font-size: 13px;
}
.check {
  width: 48px;
  padding-right: 0;
}

</style>