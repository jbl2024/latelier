<template>
  <div v-if="meeting">
    <select-date
      v-model="showSelectDate"
      :disable-time="true"
      @select="selectActionDueDate"
    />
    <meeting-attendees-dialog
      ref="assignedToDialog"
      :key="selectedActionId"
      :is-shown.sync="showAssignedToDialog"
      :attendees="meeting.attendees"
      :project-id="meeting.projectId"
      :multiple="false"
      @select-attendees="selectActionAssignedTo"
    >
      <template #title>
        {{ $t(`meetings.actions.selectAssignedTo`) }}
      </template>
    </meeting-attendees-dialog>
    <v-card class="flex-container">
      <v-toolbar class="flex0" dense>
        <rich-editor-menu-bar :editor="currentEditor" />
        <v-spacer />
        <v-btn color="primary" dark @click="editMeeting">
          <v-icon left>
            mdi-pencil
          </v-icon>
          Editer la réunion
        </v-btn>
      </v-toolbar>
      <v-card-text class="flex1">
        <div class="list">
          <h1>{{ meeting.name }}</h1>
          <div v-if="meeting.description" v-html="meeting.description" />
          <h2>{{ $t("meetings.agenda.agenda") }}</h2>
          <rich-editor
            ref="editor1"
            v-model="meeting.agenda"
            class="editor"
            hide-toolbar
            autofocus
            @on-focus="setCurrentEditor"
          />
          <h2>
            {{ $t("meetings.report.report") }}
          </h2>
          <rich-editor
            v-model="meeting.report"
            class="editor"
            hide-toolbar
            @on-focus="setCurrentEditor"
          />
          <div class="actions">
            <meeting-actions-table
              :actions="actions"
              @add-new-action="addNewAction"
              @save-action="saveAction"
              @delete-action="deleteAction"
              @choose-action-assigned-to="chooseActionAssignedTo"
              @choose-action-due-date="chooseActionDueDate"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import debounce from "lodash/debounce";
import MeetingActionsTable from "/imports/ui/meetings/MeetingActions/MeetingActionsTable";
import MeetingAttendeesDialog from "/imports/ui/meetings/Meeting/MeetingAttendees/MeetingAttendeesDialog";
import MeetingUtils from "/imports/api/meetings/utils";
import deepCopy from "/imports/ui/utils/deepCopy";
import Api from "/imports/ui/api/Api";

export default {
  components: {
    MeetingActionsTable,
    MeetingAttendeesDialog
  },
  props: {
    meeting: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      currentEditor: null,
      selectedAction: null,
      showSelectDate: false,
      showAssignedToDialog: false,
      savedActions: [],
      draftActions: []
    };
  },
  computed: {
    actions() {
      return this.savedActions.concat(this.draftActions);
    },
    selectedActionId() {
      if (!this.selectedAction?.actionId) return null;
      return this.selectedAction.actionId;
    }
  },
  watch: {
    "meeting.agenda"(agenda) {
      this.updateAgenda(agenda);
    },
    "meeting.report"(report) {
      this.updateReport(report);
    },
    "meeting.actions": {
      immediate: true,
      handler() {
        this.savedActions = deepCopy(
          this.meeting?.actions ? this.meeting.actions : []
        );
      }
    },
    savedActions: {
      handler() {
        const savedActionsIds = this.savedActions.map(
          (action) => action.actionId
        );
        this.draftActions = this.draftActions.filter(
          (a) => !savedActionsIds.includes(a.actionId)
        );
      }
    }
  },
  methods: {
    updateAgenda: debounce(function () {
      Meteor.call(
        "meetings.updateAgenda",
        {
          meetingId: this.meeting._id,
          agenda: this.meeting.agenda
        },
        (error) => {
          if (error) {
            this.$notifyError(error);
          }
        }
      );
    }, 1000),

    updateReport: debounce(function () {
      Meteor.call(
        "meetings.updateReport",
        {
          meetingId: this.meeting._id,
          report: this.meeting.report
        },
        (error) => {
          if (error) {
            this.$notifyError(error);
          }
        }
      );
    }, 1000),
    async deleteAction(action) {
      try {
        const res = await this.$confirm(this.$t("Confirm"), {
          title: this.$t("meetings.actions.deleteAction?"),
          cancelText: this.$t("Cancel"),
          confirmText: this.$t("Delete")
        });
        if (!res || res === false);

        // Draft
        const draftActionIndex = this.getActionIndex(action, this.draftActions);
        if (draftActionIndex > -1) {
          this.draftActions.splice(draftActionIndex, 1);
          return;
        }

        // Saved
        const savedActionIndex = this.getActionIndex(action, this.savedActions);
        if (savedActionIndex === -1) return;
        await Api.call("meetings.deleteActions", {
          meetingId: this.meeting._id,
          actionsIds: [action.actionId]
        });
        this.$notify(this.$t("meetings.actions.deleteActionSuccess"));
        await this.fetchSavedActions();
      } catch (error) {
        this.$notifyError(error);
      }
    },
    async saveAction(action) {
      try {
        const draftActionIndex = this.getActionIndex(action, this.draftActions);
        // Create draft
        if (draftActionIndex > -1) {
          await Api.call("meetings.createAction", {
            meetingId: this.meeting._id,
            action: action
          });
          this.$notify(this.$t("meetings.actions.createActionSuccess"));
          // Update existing
        } else {
          savedActionIndex = this.getActionIndex(action, this.savedActions);
          if (savedActionIndex > -1) {
            await Api.call("meetings.updateAction", {
              meetingId: this.meeting._id,
              action: action
            });
          }
        }
        await this.fetchSavedActions();
      } catch (error) {
        this.$notifyError(error);
      }
    },
    chooseActionAssignedTo(action) {
      this.selectedAction = action;
      this.$nextTick(() => {
        this.showAssignedToDialog = true;
      });
    },
    async selectActionAssignedTo(attendees) {
      if (!Array.isArray(attendees) || !attendees.length) return;
      const action = {
        ...this.selectedAction,
        assignedTo: MeetingUtils.sanitizeAttendee(attendees[0])
      };
      await this.saveAction(action);
      this.selectedAction = null;
      this.showAssignedToDialog = false;
    },
    async selectActionDueDate(date) {
      const action = { ...this.selectedAction, dueDate: date };
      await this.saveAction(action);
      this.selectedAction = null;
      this.showSelectDate = false;
    },
    chooseActionDueDate(action) {
      this.selectedAction = action;
      this.showSelectDate = true;
    },
    getActionIndex(action, stack) {
      return stack.findIndex(
        (stackAction) => stackAction.actionId === action.actionId
      );
    },
    addNewAction() {
      this.draftActions.push(MeetingUtils.makeNewMeetingAction());
    },
    async fetchSavedActions() {
      try {
        const meetingActions = await Api.call("meetings.getActions", {
          meetingId: this.meeting._id
        });
        this.savedActions = meetingActions && Array.isArray(meetingActions) ? meetingActions : [];
      } catch (error) {
        this.$notifyError(error);
        this.savedActions = [];
      }
    },
    setCurrentEditor(editor) {
      this.currentEditor = editor.editor;
    },
    editMeeting() {
      this.$emit("edit-meeting", this.meeting);
    }
  }
};
</script>

<style scoped>
.editor {
  color: black;
  font-size: 16px;
  line-height: 1.5;
  background-color: white;
  margin-top: 24px;
  margin-bottom: 24px;
}

.flex-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: #e5e5e5;
}

.actions {
  margin-top: 1rem;
  margin-bottom: 6rem;
}

.flex0 {
  flex: 0;
  height: 100%;
}

.flex1 {
  flex: 1; /* takes the remaining height of the "container" div */
  overflow: auto; /* to scroll just the "main" div */
}

.list {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
