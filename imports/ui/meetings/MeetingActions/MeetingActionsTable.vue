<template>
  <div class="meeting-actions-table">
    <v-data-table
      :headers="headers"
      :items="actions"
      item-key="actionId"
      :no-data-text="$t('meetings.actions.none')"
    >
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-toolbar-title>
            {{ $t("meetings.actions.title") }}
            <v-btn dark color="primary" icon @click="addNewAction">
              <v-icon>
                mdi-plus
              </v-icon>
            </v-btn>
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </v-toolbar>
      </template>
      <!-- Type -->
      <template v-slot:item.type="{ item }">
        <v-menu offset-y :nudge-bottom="10">
          <template v-slot:activator="{ on, attrs }">
            <v-chip
              :color="getTypeColor(item.type)"
              dark
              v-bind="attrs"
              v-on="on"
            >
              {{ $t(`meetings.actions.types.${item.type}`) }}
            </v-chip>
          </template>
          <v-list>
            <v-list-item
              v-for="(type, index) in types"
              :key="index"
              @click="selectActionType(item, type.value)"
            >
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
              auto-grow
              autofocus
              hide-details
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
          @click="chooseActionAssignedTo(item)"
          :close="Boolean(item.assignedTo)"
          @click:close="clearAssignedTo(item)"
        >
          <v-icon left>
            mdi-account
          </v-icon>
          <span>
            {{ item.assignedTo == null 
              ? $t("meetings.actions.addAssignedTo") : getAttendeeName(item.assignedTo)
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
          <v-chip v-else color="success" @click="chooseActionDueDate(item)">
            {{ formatDate(item.dueDate) }}
          </v-chip>
        </div>
      </template>
      <!-- Actions on row -->
      <template v-slot:item.actions="{ item }">
        <v-icon small @click="deleteAction(item)">
          mdi-close
        </v-icon>
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
    }
  },
  data() {
    return {
      types: [
        {
          text: this.$t("meetings.actions.types.action"),
          value: "action"
        },
        {
          text: this.$t("meetings.actions.types.information"),
          value: "information"
        },
        {
          text: this.$t("meetings.actions.types.decision"),
          value: "decision"
        }
      ],
      headers: [
        { text: "N°", value: "number" },
        { text: "Type", value: "type" },
        { text: "Description", value: "description" },
        { text: "Responsable", value: "assignedTo" },
        { text: "Pour le", value: "dueDate", width: 50 },
        { text: "Actions", value: "actions", sortable: false, width: 80 }
      ],
      editedAction: null,
      originalAction: null
    };
  },
  methods: {
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
      this.saveAction(this.originalAction);
      this.clearEdit();
    },
    saveAction(action) {
      this.$emit("save-action", action);
    },
    deleteAction(action) {
      this.$emit("delete-action", action);
    },
    chooseActionAssignedTo(action) {
      this.$emit("choose-action-assigned-to", action);
    },
    chooseActionDueDate(action) {
      this.$emit("choose-action-due-date", action);
    },
    addNewAction() {
      this.$emit("add-new-action");
    },
    clearEdit() {
      this.editedAction = null;
      this.originalAction = null;
    },
    getTypeColor() {
      return "success";
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
}
</style>
