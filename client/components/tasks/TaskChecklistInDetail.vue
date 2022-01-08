<template>
  <div
    v-show="showList(task.checklist)"
    class="task-checklist-in-detail"
    @click.stop
  >
    <div class="progress">
      <v-progress-linear :value="completion" />
    </div>

    <v-simple-table
      v-if="task.checklist && task.checklist.length > 0"
      class="tasks-wrapper elevation-1"
    >
      <tbody v-sortable-list="moveItem">
        <tr v-for="checkItem in task.checklist" :key="checkItem._id">
          <td class="check">
            <div class="checkbox">
              <div class="pretty p-svg p-curve">
                <input
                  v-model="checkItem.checked"
                  type="checkbox"
                  @change="toggleCheckItem(checkItem)"
                  @click="(e) => e.stopPropagation()"
                >
                <div class="state p-primary">
                  <svg class="svg svg-icon" viewBox="0 0 20 20">
                    <!-- eslint-disable -->
                    <path
                      d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z"
                      style="stroke: white; fill: white;"
                    ></path>
                    <!-- eslint-enable -->
                  </svg>
                  <label />
                </div>
              </div>
            </div>
          </td>
          <td
            class="edit"
            @click="startEditCheckItem(checkItem)"
          >
            <template v-if="!isCheckItemEdited(checkItem)">
              <span v-html="linkifyHtml(checkItem.name)" />
            </template>
            <template v-if="isCheckItemEdited(checkItem)">
              <v-textarea
                v-model="checkItem.name"
                autofocus
                outlined
                auto-grow
                :rows="3"
                solo
                @keyup.esc="cancelUpdateCheckItem(checkItem)"
                @keydown.shift.enter="updateCheckItem(checkItem)"
              />
              <v-btn icon text @click.native.stop="updateCheckItem(checkItem)">
                <v-icon color="green">
                  mdi-check-circle
                </v-icon>
              </v-btn>

              <v-btn
                icon
                text
                @click.native.stop="cancelUpdateCheckItem(checkItem)"
              >
                <v-icon color="red">
                  mdi-close-circle
                </v-icon>
              </v-btn>
            </template>
          </td>
          <td class="table-actions">
            <v-icon style="cursor: row-resize;" class="sortHandle">
              mdi-drag-vertical
            </v-icon>
          </td>
          <td class="table-actions">
            <v-menu bottom left class="menu" :close-on-content-click="false">
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item>
                  <v-list-item-title>{{ $t("Move") }}</v-list-item-title>
                  <v-list-item-action>
                    <v-btn icon small @click="moveUp(checkItem)">
                      <v-icon>mdi-arrow-up</v-icon>
                    </v-btn>
                  </v-list-item-action>
                  <v-list-item-action>
                    <v-btn icon small @click="moveDown(checkItem)">
                      <v-icon>mdi-arrow-down</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>{{ $t("Delete") }}</v-list-item-title>
                  <v-list-item-action>
                    <v-btn icon small @click="deleteItem(checkItem)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-menu>
          </td>
        </tr>
      </tbody>
    </v-simple-table>

    <v-text-field
      ref="newItem"
      v-model="item"
      class="add-item"
      append-icon="mdi-send"
      :label="$t('New item')"
      @keyup.enter="addItem"
      @click:append="addItem"
    />
  </div>
</template>

<script>
import "moment/locale/fr";
import Sortable from "sortablejs";
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";

export default {
  name: "TaskChecklistInDetail",
  directives: {
    sortableList: {
      bind(el, binding) {
        const options = {
          handle: ".sortHandle",
          animation: 150,
          forceFallback: true,
          fallbackTolerance: 4,
          touchStartThreshold: 4,
          onUpdate: function (event) {
            binding.value(event);
          }
        };
        Sortable.create(el, options);
      }
    }
  },
  mixins: [TextRenderingMixin],
  props: {
    hideIfEmpty: {
      type: Boolean,
      value: false
    },
    task: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      editNewItem: false,
      item: "",
      completion: 0,
      selectedCheckItem: null,
      savedName: null
    };
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
        task.checklist.forEach((item) => {
          if (item.checked) {
            completedItems += 1;
          }
        });
        this.completion = 100 * (completedItems / totalItems);
      }
    }
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
        (error) => {
          if (!error) {
            this.item = "";
          }
        }
      );
    },

    deleteItem(item) {
      this.$confirm(this.$t("Delete element?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
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
      }).then((res) => {
        if (res) {
          Meteor.call("tasks.convertItemToTask", this.task._id, item._id);
        }
      });
    },

    isCheckItemEdited(item) {
      if (!this.selectedCheckItem) {
        return false;
      }
      return item._id === this.selectedCheckItem._id;
    },

    startEditCheckItem(item) {
      if (this.isCheckItemEdited(item)) {
        return;
      }
      this.selectedCheckItem = item;
      this.savedName = item.name;
    },

    cancelUpdateCheckItem(item) {
      item.name = this.savedName;
      this.selectedCheckItem = null;
    },

    updateCheckItem(item) {
      if (!this.isCheckItemEdited(item)) {
        return;
      }
      Meteor.call("tasks.updateCheckListItem", this.task._id, item);
      this.selectedCheckItem = null;
    },

    moveItem({ oldIndex, newIndex }) {
      const moved = this.task.checklist.splice(oldIndex, 1)[0];
      this.task.checklist.splice(newIndex, 0, moved);
      Meteor.call("tasks.updateCheckList", this.task._id, this.task.checklist);
    },

    moveUp(item) {
      const oldIndex = this.task.checklist.findIndex(
        (anItem) => anItem._id === item._id
      );
      if (oldIndex === 0) {
        return;
      }
      const newIndex = oldIndex - 1;
      this.moveItem({ oldIndex, newIndex });
    },

    moveDown(item) {
      const oldIndex = this.task.checklist.findIndex(
        (anItem) => anItem._id === item._id
      );
      if (oldIndex === this.task.checklist.length - 1) {
        return;
      }
      const newIndex = oldIndex + 1;
      this.moveItem({ oldIndex, newIndex });
    }

    // moveItem(oldIndex, newIndex) {
    //   [this.task.checklist[oldIndex], this.task.checklist[newIndex]] = [
    //     this.task.checklist[newIndex],
    //     this.task.checklist[oldIndex]
    //   ];
    //   Meteor.call("tasks.updateCheckList", this.task._id, this.task.checklist);
    // },
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
.add-item {
  margin-left: 8px;
  margin-right: 8px;
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

.table-actions {
  padding: 0;
}
</style>
