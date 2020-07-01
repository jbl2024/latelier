<template>
  <div v-if="meeting" class="meeting-detail-card">
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
      </v-toolbar>
      <v-card-text class="flex1">
        <div class="list">
          <h1>
            {{ meeting.name }}
            <v-btn color="primary" icon @click="editMeeting">
              <v-icon>
                mdi-pencil
              </v-icon>
            </v-btn>
          </h1>
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
          <template v-if="hasDocuments">
            <h2
              class="documents-title"
              @click="showDocuments = !showDocuments"
            >
              {{ $t("meetings.documents.documents") }}
              <v-icon :class="['documents-chevron', showDocuments ? 'active' : null]">
                mdi-chevron-down
              </v-icon>
            </h2>
            <div v-show="showDocuments" class="content documents">
              <attachments
                display="list"
                :label="$t('meetings.attachments.meetingAttachments')"
                :attachments="attachments"
                no-list-header
                read-only
              />
            </div>
          </template>
          <h2>
            {{ $t("meetings.actions.title") }}
          </h2>
          <div class="content actions">
            <meeting-actions-table
              :actions="actions"
              :tasks="tasks"
              @select-task="selectTask"
              @add-new-action="addNewAction"
              @save-action="saveAction"
              @create-task="createTask"
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
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import debounce from "lodash/debounce";
import MeetingActionsTable from "/imports/ui/meetings/MeetingActions/MeetingActionsTable";
import MeetingAttendeesDialog from "/imports/ui/meetings/Meeting/MeetingAttendees/MeetingAttendeesDialog";
import MeetingUtils from "/imports/api/meetings/utils";
import Attachments from "/imports/ui/attachments/Attachments";
import deepCopy from "/imports/ui/utils/deepCopy";
import Api from "/imports/ui/api/Api";
import moment from "moment";

export default {
  components: {
    MeetingActionsTable,
    MeetingAttendeesDialog,
    Attachments
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
      showDocuments: false,
      actions: [],
      attachments: []
    };
  },
  computed: {
    selectedActionId() {
      if (!this.selectedAction?.actionId) return null;
      return this.selectedAction.actionId;
    },
    hasDocuments() {
      if (!this.meeting) return false;
      return Array.isArray(this.meeting?.documents) && this.meeting.documents.length > 0;
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
        this.actions = deepCopy(
          this.meeting?.actions ? this.meeting.actions : []
        );
      }
    },
    "meeting.documents": {
      immediate: true,
      handler() {
        if (!Array.isArray(this.meeting?.documents) || !this.meeting.documents.length) return;
        Api.call("attachments.find", {
          attachmentsIds: this.meeting.documents.map((document) => document.documentId)
        }).then((result) => {
          this.attachments = result.data;
        }, (error) => {
          this.$notifyError(error);
        });
      }
    }
  },
  meteor: {
    tasks: {
      params() {
        return {
          tasksIds: this.actions.map((action) => action.taskId)
        };
      },
      update({ tasksIds }) {
        return Tasks.find({ _id: { $in: tasksIds } });
      }
    },
    firstList: {
      params() {
        return {
          projectId: this.meeting.projectId
        };
      },
      update({ projectId }) {
        return Lists.findOne({ projectId }, { sort: { order: 1 } });
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
      if (!action) return;
      const res = await this.$confirm(this.$t("Confirm"), {
        title: this.$t("meetings.actions.deleteAction?"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      });
      if (!res || res === false) return;
      await Api.call("meetings.deleteActions", {
        meetingId: this.meeting._id,
        actionsIds: [action.actionId]
      });
      this.$notify(this.$t("meetings.actions.deleteActionSuccess"));
      await this.fetch();
    },
    async saveAction(action) {
      if (action.dueDate) {
        action.dueDate = moment(action.dueDate).format("YYYY-MM-DD");
      }

      // update list before loading from server to avoid flickering
      const actionIndex = this.actions.findIndex((a) => a.actionId === action.actionId);
      if (actionIndex > -1) {
        this.$set(this.actions, actionIndex, deepCopy(action));
      }

      await Api.call("meetings.updateAction", {
        meetingId: this.meeting._id,
        action: action
      });

      await this.fetch();
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
        assignedTo: attendees[0].userId
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
      Api.call("meetings.createAction", {
        meetingId: this.meeting._id,
        action: MeetingUtils.makeNewMeetingAction()
      }).then(() => {
        this.fetch();
      }, (error) => {
        this.$notifyError(error);
      });
    },

    async fetch() {
      try {
        const meetingActions = await Api.call("meetings.getActions", {
          meetingId: this.meeting._id
        });
        this.actions = meetingActions && Array.isArray(meetingActions) ? meetingActions : [];
      } catch {
        this.actions = [];
      }
    },
    async createTask(action) {
      if (!this.firstList?._id) {
        this.$notify(this.$t("meetings.actions.noTaskList"));
        return;
      }
      if (action.taskId) {
        this.$notify(this.$t("meetings.actions.alreadyHasTask"));
        return;
      }

      if (!action.description) {
        this.$notify(this.$t("meetings.actions.noDescription"));
        return;
      }

      const createdTask = await Api.call(
        "tasks.insert",
        this.meeting.projectId,
        this.firstList._id,
        action.description,
        [],
        action?.assignedTo ? action.assignedTo : null,
        action?.dueDate ? moment(action.dueDate).format("YYYY-MM-DD HH:mm") : null
      ).catch(() => {
        this.$notifyError(this.$t("meetings.actions.createTaskFailed"));
      });

      await this.saveAction({ ...action, taskId: createdTask._id }).catch(() => {
        this.$notifyError(this.$t("meetings.actions.saveActionFailed"));
      });
      this.$notify(this.$t("meetings.actions.createTaskSuccess"));
    },
    selectTask(task) {
      this.$store.dispatch("selectTask", task);
      this.$store.dispatch("showTaskDetail", true);
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
.meeting-detail-card h2 {
  margin-bottom: 24px;
}

.editor {
  color: black;
  font-size: 16px;
  line-height: 1.5;
  background-color: white;
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

.content {
  border: 1px solid #ccc;
  margin-bottom: 24px;
}

.actions {
  margin-bottom: 6rem;
}

.documents-title {
  cursor: pointer;
}

.documents-chevron.active.v-icon {
  transform: rotate(-180deg);
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
