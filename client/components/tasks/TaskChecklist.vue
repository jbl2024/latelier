<template>

  <div class="task-checklist" v-show="showList(task.checklist)">

    <confirm-dialog
      :active.sync="showConfirmConvertDialog"
      title="Transformer en tache"
      content="Voulez-vous transformer cet élément en tache ?"
      confirm-text="Transformer"
      cancel-text="Annuler"
      @cancel="onCancelConvert"
      @confirm="onConfirmConvert"
    />

    <confirm-dialog
      :active.sync="showConfirmDeleteDialog"
      title="Supprimer"
      content="Voulez-vous supprimer cet élément ?"
      confirm-text="Supprimer"
      cancel-text="Annuler"
      @cancel="onCancelDelete"
      @confirm="onConfirmDelete"
    />


    <div v-for="item in task.checklist" :key="item._id" class="item" @mouseover="showButtons = item._id" @mouseleave="showButtons = null">
      <div>
        <div class="check">

          <div class="pretty p-default">
                <input type="checkbox" v-model="item.checked" :id="item._id" @change="toggleCheckItem(item)" @click.stop=""/>
                <div class="state p-primary">
                    <label>{{ item.name }}</label>
                </div>
          </div>
          
        </div>
        <div class="right" v-show="showButtons === item._id">
          <v-btn icon @click="event => { event.stopPropagation(); selectedItem = item; showConfirmConvertDialog = true;}">
            <v-icon>list</v-icon>
          </v-btn>
          <v-btn icon @click="event => { event.stopPropagation(); selectedItem = item; showConfirmDeleteDialog = true;}">
            <v-icon s-icon>delete</v-icon>
          </v-btn>
        </div>
        <div class="clear"></div>
      </div>
    </div>
  </div>

</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import moment from "moment";
import "moment/locale/fr";

export default {
  name: "task-checklist",
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
      showConfirmConvertDialog: false,
      showConfirmDeleteDialog: false,
      editNewItem: false,
      selectedItem: {},
      showButtons: null
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

    onConfirmConvert() {
      this.showConfirmConvertDialog = false;
      Meteor.call("tasks.convertItemToTask", this.task._id, this.selectedItem._id);
    },

    onCancelConvert(item) {
      this.showCancelConvertDialog = false;
    },

    onConfirmDelete() {
      this.showConfirmDeleteDialog = false;
      Meteor.call("tasks.removeChecklistItem", this.task._id, this.selectedItem._id);
    },

    onCancelDelete(item) {
      this.showCancelConvertDialog = false;
    }
  }
};
</script>

<style scoped>
.task-checklist {
  margin-bottom: 12px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.item {
  min-width: 250px;
}

.check {
  float: left;
  white-space: nowrap;
  overflow: hidden;
  box-sizing: border-box;
  text-overflow: ellipsis;
  margin-top: 0;
  font-size: 12px;
  margin-top: 12px;
}

.right {
  position: absolute;
  right: 0;
  white-space: nowrap;
  overflow: hidden;
  box-sizing: border-box;
  text-overflow: ellipsis;
}

.clear {
  clear: both;
}

pre {
  font-family: Roboto, Noto Sans, -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: pre-wrap;
}

.delete-button {
}

.empty-state {
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

.metadata .action .v-btn {
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
.pretty .state label:before {
  background-color: white;
}

</style>