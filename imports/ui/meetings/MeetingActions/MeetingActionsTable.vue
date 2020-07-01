<template>
  <div class="meeting-actions-table">
    <v-data-table
      v-model="selectedActions"
      :headers="headers"
      :items="actions"
      item-key="actionId"
      show-select
      :no-data-text="$t('meetings.actions.none')"
    >
      <template v-slot:top>
        <v-toolbar flat color="white">
          <template v-if="selectedActions && selectedActions.length">
            <v-btn
              v-if="selectedActionsWithoutTasks.length > 0"
              color="primary"
              class="mr-4"
              dark
              @click="createTasks(selectedActions)"
            >
              <v-icon left>
                mdi-format-list-bulleted
              </v-icon>
              {{ $t("meetings.actions.createTasks") }}
            </v-btn>
            <v-btn
              color="error"
              dark
              @click="deleteActions(selectedActions)"
            >
              <v-icon left>
                mdi-delete
              </v-icon>
              {{ $t("meetings.actions.deleteSelected") }}
            </v-btn>
          </template>
          <v-spacer />
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
        <div
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
          :close="Boolean(item.assignedTo)"
          @click="chooseActionAssignedTo(item)"
          @click:close="clearAssignedTo(item)"
        >
          <v-icon left>
            mdi-account
          </v-icon>
          <span>
            {{
              item.assignedTo == null
                ? $t("meetings.actions.addAssignedTo")
                : item.assignedTo
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
            close
            @click="chooseActionDueDate(item)"
            @click:close="clearActionDueDate(item)"
          >
            {{ formatDate(item.dueDate) }}
          </v-chip>
        </div>
      </template>
      <template v-slot:item.taskId="{ item }">
        <button v-if="findActionTask(item)" text @click="selectTask(findActionTask(item))">
          <span class="action-task">
            <v-icon v-if="findActionTask(item).completed" small>mdi-check-box-outline</v-icon>
            {{ findActionTask(item).name }}
          </span>
        </button>
      </template>
    </v-data-table>
  </div>
</template>
<script>
import MeetingAttendeeMixin from "/imports/ui/mixins/MeetingAttendeeMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin";
import deepCopy from "/imports/ui/utils/deepCopy";

export default {
  mixins: [MeetingAttendeeMixin, DatesMixin],
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
        { text: "Type", value: "type" },
        { text: "Tâche", value: "taskId", width: 200 },
        { text: "Description", value: "description" },
        { text: "Responsable", value: "assignedTo" },
        { text: "Pour le", value: "dueDate", width: 50 }
      ]),
      editedAction: null,
      originalAction: null
    };
  },
  computed: {
    selectedActionsWithoutTasks() {
      return this.selectedActions.filter((a) => !a.taskId);
    },
    actionsIds() {
      return this.actions.map((a) => a.actionId);
    }
  },
  watch: {
    actions: {
      immediate: true,
      handler() {
        this.selectedActions = this.selectedActions
          .filter((sel) => this.actionsIds.includes(sel.actionId))
          .map((sel) => this.actions.find((a) => a.actionId === sel.actionId));
      }
    }
  },
  methods: {
    selectTask(task) {
      this.$emit("select-task", task);
    },
    findActionTask(action) {
      return this.tasks.find((task) => task._id === action.taskId);
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
    deleteActions(actions) {
      this.$emit("delete-actions", actions);
    },
    createTasks(actions) {
      this.$emit("create-tasks", actions);
    },
    chooseActionAssignedTo(action) {
      this.$emit("choose-action-assigned-to", action);
    },
    chooseActionDueDate(action) {
      this.$emit("choose-action-due-date", action);
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
  .action-task {
    text-decoration: underline;
  }
}
</style>
