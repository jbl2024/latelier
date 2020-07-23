<template>
  <div class="meeting-actions-table">
    <v-data-table
      v-model="selectedActions"
      :headers="headers"
      :items="meetingActions"
      item-key="actionId"
      disable-pagination
      hide-default-footer
      :no-data-text="$t('meetings.actions.none')"
    >
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-btn outlined color="primary" @click="addNewAction">
            <v-icon left>
              mdi-plus
            </v-icon>
            {{ $t("meetings.actions.addAction") }}
          </v-btn>
        </v-toolbar>
      </template>
      <!-- Type -->
      <template v-slot:item.type="{ item }">
        <v-menu offset-y :nudge-bottom="10">
          <template v-slot:activator="{ on, attrs }">
            <v-chip
              :color="types[item.type].color"
              dark
              v-bind="attrs"
              v-on="on"
            >
              <v-icon left>
                {{ types[item.type].icon }}
              </v-icon>
              {{ types[item.type].text }}
            </v-chip>
          </template>
          <v-list dense>
            <v-list-item
              v-for="(type, index) in types"
              :key="index"
              @click="selectActionType(item, type.value)"
            >
              <v-list-item-icon>
                <v-icon :color="type.color">
                  {{ type.icon }}
                </v-icon>
              </v-list-item-icon>
              <v-list-item-title>{{ type.text }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <!-- Description -->
      <template v-slot:item.description="{ item }">
        <button
          v-if="item.taskId && tasksByIds[item.taskId]"
          text
          @click="selectTask(tasksByIds[item.taskId])"
        >
          <span class="action-task">
            <v-icon v-if="tasksByIds[item.taskId].completed" small>
              mdi-check-box-outline
            </v-icon>
            {{ tasksByIds[item.taskId].name }}
          </span>
        </button>
        <div
          v-else
          :class="[
            'description-cell',
            isEditingAction(item) ? 'is-editing' : null,
          ]"
        >
          <div v-if="isEditingAction(item)">
            <v-textarea
              v-model="editedAction.description"
              solo
              outlined
              auto-grow
              autofocus
              hide-details
              @keydown.shift.enter="saveEditedAction"
              @keyup.esc="cancelEdit(item)"
            />
            <v-btn text icon @click="saveEditedAction">
              <v-icon color="green">
                mdi-check-circle
              </v-icon>
            </v-btn>
            <v-btn text icon @click="cancelEdit(item)">
              <v-icon color="red">
                mdi-close-circle
              </v-icon>
            </v-btn>
          </div>
          <div
            v-else
            class="description-display"
            @click.stop="editAction(item)"
          >
            <span v-if="item.description">
              {{ item.description }}
            </span>
            <v-chip v-else>
              <v-icon left>
                mdi-text-subject
              </v-icon>
              {{ $t("meetings.actions.addDescription") }}
            </v-chip>
          </div>
        </div>
      </template>
      <!-- Assigned to -->
      <template v-slot:item.assignedTo="{ item }">
        <v-chip
          :color="item.assignedTo == null ? null : 'success'"
          :close="!item.taskId && Boolean(item.assignedTo)"
          @click="chooseActionAssignedTo(item)"
          @click:close="clearAssignedTo(item)"
        >
          <v-icon left>
            mdi-account
          </v-icon>
          <span>
            {{
              usersByIds[item.assignedTo]
                ? getUserProfileName(usersByIds[item.assignedTo])
                : $t("meetings.actions.addAssignedTo")
            }}
          </span>
        </v-chip>
      </template>
      <!-- Due date -->
      <template v-slot:item.dueDate="{ item }">
        <div>
          <v-chip
            v-if="item.dueDate == null"
            @click="chooseActionDueDate(item)"
          >
            <v-icon left>
              mdi-calendar
            </v-icon>
            {{ $t("meetings.actions.addDueDate") }}
          </v-chip>
          <v-chip
            v-else
            color="success"
            :close="!item.taskId"
            @click="chooseActionDueDate(item)"
            @click:close="clearActionDueDate(item)"
          >
            {{ formatDateTime(item.dueDate) }}
          </v-chip>
        </div>
      </template>
      <!-- Actions on row -->
      <template v-slot:item.actions="{ item }">
        <div class="actions">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                fab
                x-small
                color="success"
                dark
                class="mr-2"
                v-on="on"
                @click.stop="createTask(item)"
              >
                <v-icon>
                  mdi-format-list-bulleted
                </v-icon>
              </v-btn>
            </template>
            <span v-if="item.taskId && tasksByIds[item.taskId]">
              {{ $t("meetings.actions.consultTask") }}
            </span>
            <span v-else>
              {{ $t("meetings.actions.createAssociatedTask") }}
            </span>
          </v-tooltip>
          <v-tooltip
            v-if="item.taskId && tasksByIds[item.taskId]"
            bottom
          >
            <template v-slot:activator="{ on }">
              <v-btn
                fab
                x-small
                color="error"
                dark
                v-on="on"
                @click="unlinkTask(item)"
              >
                <v-icon>
                  mdi-link-variant-off
                </v-icon>
              </v-btn>
            </template>
            <span>
              {{ $t("meetings.actions.unlinkTask") }}
            </span>
          </v-tooltip>
          <v-tooltip v-else bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                fab
                x-small
                color="error"
                dark
                v-on="on"
                @click="deleteAction(item)"
              >
                <v-icon>
                  mdi-close
                </v-icon>
              </v-btn>
            </template>
            <span>
              {{ $t("meetings.actions.deleteAction") }}
            </span>
          </v-tooltip>
        </div>
      </template>
    </v-data-table>
  </div>
</template>
<script>
import DatesMixin from "/imports/ui/mixins/DatesMixin";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import deepCopy from "/imports/ui/utils/deepCopy";

export default {
  mixins: [DatesMixin, usersMixin],
  props: {
    actions: {
      type: Array,
      default() {
        return [];
      }
    },
    tasks: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      selectedActions: [],
      users: [],
      types: Object.freeze({
        action: {
          text: this.$t("meetings.actions.types.action"),
          icon: "mdi-play-circle",
          color: "success",
          value: "action"
        },
        information: {
          text: this.$t("meetings.actions.types.information"),
          icon: "mdi-information-outline",
          color: "indigo",
          value: "information"
        },
        decision: {
          text: this.$t("meetings.actions.types.decision"),
          icon: "mdi-bullseye-arrow",
          color: "accent",
          value: "decision"
        }
      }),
      headers: Object.freeze([
        { text: this.$t("Type"), value: "type" },
        { text: this.$t("Description"), value: "description" },
        { text: this.$t("meetings.actions.assignedTo"), value: "assignedTo" },
        { text: this.$t("meetings.actions.dueDate"), value: "dueDate", width: 50 },
        { text: "", value: "actions", sortable: false, width: 80 }
      ]),
      editedAction: null,
      originalAction: null
    };
  },
  computed: {
    meetingActions() {
      return this.actions.map((action) => {
        if (action.taskId && this.tasksByIds[action.taskId]) {
          const task = this.tasksByIds[action.taskId];
          action.dueDate = task.dueDate;
          action.assignedTo = task.assignedTo;
          action.description = task.name;
        }
        return action;
      });
    },
    meetingActionsIds() {
      return this.meetingActions.map((a) => a.actionId);
    },
    selectedActionsWithoutTasks() {
      return this.selectedActions.filter((a) => !a.taskId);
    },
    meetingActionsAssignedTos() {
      return this.meetingActions.map((a) => a.assignedTo);
    },
    usersByIds() {
      if (!this.users || !Array.isArray(this.users) || !this.users.length) return {};
      return this.users.reduce((usersByIds, user) => {
        if (!usersByIds[user._id]) {
          usersByIds[user._id] = user;
        }
        return usersByIds;
      }, {});
    },
    tasksByIds() {
      if (!this.tasks || !Array.isArray(this.tasks) || !this.tasks.length) return {};
      return this.tasks.reduce((tasksByIds, task) => {
        if (!tasksByIds[task._id]) {
          tasksByIds[task._id] = task;
        }
        return tasksByIds;
      }, {});
    }
  },
  watch: {
    actions: {
      immediate: true,
      handler() {
        this.selectedActions = this.selectedActions
          .filter((sel) => this.meetingActionsIds.includes(sel.actionId))
          .map((sel) => this.meetingActions.find((a) => a.actionId === sel.actionId));
      }
    },
    meetingActionsAssignedTos: {
      immediate: true,
      handler() {
        const users = Meteor.users.find({ _id: { $in: this.meetingActionsAssignedTos } }).fetch();
        this.users = Array.isArray(users) ? users : [];
      }
    }
  },
  methods: {
    selectTask(task) {
      this.$emit("select-task", task);
    },
    isEditingAction(action) {
      if (this.editedAction == null) return false;
      return this.editedAction?.actionId === action.actionId;
    },
    editAction(action) {
      this.originalAction = deepCopy(action);
      this.editedAction = deepCopy(action);
    },
    clearAssignedTo(action) {
      this.editAction(action);
      this.editedAction.assignedTo = null;
      this.saveEditedAction();
    },
    selectActionType(action, type) {
      this.editAction(action);
      this.editedAction.type = type;
      this.saveEditedAction();
    },
    saveEditedAction() {
      this.saveAction(this.editedAction);
      this.clearEdit();
    },
    cancelEdit() {
      this.editedAction = deepCopy(this.originalAction);
      this.clearEdit();
    },
    saveAction(action) {
      this.$emit("save-action", action);
    },
    deleteAction(action) {
      this.$emit("delete-action", action);
    },
    unlinkTask(action) {
      action.taskId = null;
      this.$emit("unlink-task", action);
    },
    createTask(action) {
      if (action.taskId && this.tasksByIds[action.taskId]) {
        this.selectTask(this.tasksByIds[action.taskId]);
      } else {
        this.$emit("create-task", action);
      }
    },
    chooseActionAssignedTo(action) {
      if (action.taskId && this.tasksByIds[action.taskId]) {
        this.selectTask(this.tasksByIds[action.taskId]);
      } else {
        this.$emit("choose-action-assigned-to", action);
      }
    },
    chooseActionDueDate(action) {
      if (action.taskId && this.tasksByIds[action.taskId]) {
        this.selectTask(this.tasksByIds[action.taskId]);
      } else {
        this.$emit("choose-action-due-date", action);
      }
    },
    clearActionDueDate(action) {
      this.editAction(action);
      this.editedAction.dueDate = null;
      this.saveEditedAction();
    },
    addNewAction() {
      this.$emit("add-new-action");
    },
    clearEdit() {
      this.editedAction = null;
      this.originalAction = null;
    }
  }
};
</script>
<style lang="scss">
.meeting-actions-table {
  .v-data-table {
    padding-bottom: 18px;
  }
  .v-data-table td,
  .v-data-table th {
    padding: 0 16px;
  }
  .v-data-table td {
    font-size: 1rem;
  }
  .description-cell {
    width: 100%;
    &.is-editing {
      margin-top: 1rem;
    }
    .description-display {
      min-height: 30px;
      display: flex;
      align-items: center;
    }
  }
  .actions {
    display: flex;
  }
  .action-task {
    text-decoration: underline;
  }
}
</style>
