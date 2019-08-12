<template>

  <div class="task-checklist" v-show="showList(task.checklist)">

    <div class="progress">
      <v-progress-linear v-model="completion"></v-progress-linear>
    </div>
    <div v-for="item in task.checklist" :key="item._id" class="item" @mouseover="showButtons = item._id" @mouseleave="showButtons = null">
      <div class="parent">
        <div class="check">

          <div class="pretty p-default">
                <input type="checkbox" v-model="item.checked" :id="item._id" @change="toggleCheckItem(item)" @click.stop=""/>
                <div class="state p-primary">
                    <label>{{ item.name }}</label>
                </div>
          </div>
          
        </div>
        <div class="right" v-show="showButtons === item._id">
          <v-icon small @click="event => { event.stopPropagation(); selectedItem = item; onConvert();}">mdi-format-list-bulleted</v-icon>
          <v-icon small @click="event => { event.stopPropagation(); selectedItem = item; onDelete();}">mdi-delete</v-icon>
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

export default {
  name: "task-checklist",
  i18n: {
    messages: {
      en: {
        "Convert element to task?": "Convert element to task?",
        "Delete element?": "Delete element?",
        "Convert": "Convert",
      },
      fr: {
        "Convert element to task?": "Transformer en tâche ?",
        "Delete element?": "Supprimer l'élément ?",
        "Convert": "Convertir",
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
      selectedItem: {},
      showButtons: null,
      completion: 75,
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

    onConvert() {
      this.$confirm(this.$t("Convert element to task?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Convert")
      }).then(res => {
        if (res) {
          Meteor.call("tasks.convertItemToTask", this.task._id, this.selectedItem._id);
        }
      });
    },

    onDelete() {
      this.$confirm(this.$t("Delete element?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then(res => {
        if (res) {
          Meteor.call("tasks.removeChecklistItem", this.task._id, this.selectedItem._id);
        }
      });
    }
  }
};
</script>

<style scoped>
.task-checklist {
  margin-bottom: 12px;
  position: relative;
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

.progress {
  padding-right: 12px;
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

.parent {
  position: relative;
}

.right {
  position: absolute;
  right: 8px;
  top: 12px;
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
.pretty {
    white-space: normal !important;
    max-width: 200px;
}

@media (max-width: 600px) {
  .pretty {
    max-width: 260px;
  }
}


.pretty .state label{
      text-indent: 0;
      padding-left: 2rem;
}

.pretty .state label:after, 
.pretty .state label:before{
     top: 0;
}



</style>
