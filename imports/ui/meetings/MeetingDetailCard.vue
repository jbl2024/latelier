<template>
  <div v-if="meeting" class="meeting-detail-card">
    <select-date v-model="showSelectDate" @select="selectActionDueDate" />
    <meeting-export v-model="showMeetingExport" :meeting="meeting" />
    <select-user
      :key="selectedActionId"
      :project="project"
      :active.sync="showSelectUser"
      :is-admin="canManageProject()"
      hide-organization
      hide-admin
      @select="selectActionAssignedTo"
    />
    <v-card class="flex-container">
      <v-toolbar class="meeting-detail-card__toolbar" dense>
        <v-row class="meeting-detail-card__row">
          <v-col v-if="$vuetify.breakpoint.mdAndUp" cols="12" sm="12" md="4">
            <div class="meeting-title-header">
              <v-btn color="primary" dark :to="meetingsRoute">
                <v-icon left>
                  mdi-chevron-left
                </v-icon>
                <span>
                  {{ $t("meetings.goBackToMeetings") }}
                </span>
              </v-btn>
              <tooltip-button
                bottom
                icon="mdi-settings"
                :tooltip="$t('Settings')"
                @on="editMeeting"
              />
              <tooltip-button
                bottom
                icon="mdi-file-export"
                :tooltip="$t('Export')"
                @on="showMeetingExport = true"
              />
              <template v-if="showLock">
                <v-btn
                  v-if="editContent == true"
                  class="ml-2"
                  outlined
                  @click="editContent = false"
                >
                  <v-icon>
                    mdi-pencil-off
                  </v-icon>
                  {{ $t("meetings.lock") }}
                </v-btn>
                <v-btn
                  v-if="editContent == false"
                  class="ml-2"
                  outlined
                  @click="editContent = true"
                >
                  <v-icon>
                    mdi-pencil
                  </v-icon>
                  {{ $t("meetings.unlock") }}
                </v-btn>
              </template>
            </div>
          </v-col>
          <v-col cols="12" sm="12" md="4">
            <div class="editor-header">
              <rich-editor-menu-bar :editor="currentEditor" />
            </div>
          </v-col>
          <v-col v-if="$vuetify.breakpoint.mdAndUp" cols="12" sm="12" md="4">
            <div class="meeting-date-header">
              <v-icon v-ripple class="mr-2" @click="editMeeting">
                mdi-clock
              </v-icon>
              <a v-ripple @click="editMeeting">{{ meetingInterval }}</a>
            </div>
          </v-col>
        </v-row>
      </v-toolbar>
      <v-card-text class="flex1">
        <div v-if="$vuetify.breakpoint.smAndDown" class="meeting-title-header">
          <v-btn color="primary" dark :to="meetingsRoute">
            <v-icon left>
              mdi-chevron-left
            </v-icon>
            <span>
              {{ $t("meetings.goBackToMeetings") }}
            </span>
          </v-btn>
          <tooltip-button
            bottom
            icon="mdi-settings"
            :tooltip="$t('Settings')"
            @on="editMeeting"
          />
          <tooltip-button
            bottom
            icon="mdi-file-export"
            :tooltip="$t('Export')"
            @on="showMeetingExport = true"
          />
          <template v-if="showLock">
            <tooltip-button
              v-if="editContent == true"
              bottom
              icon="mdi-pencil-off"
              :tooltip="$t('meetings.lock')"
              @on="editContent = false"
            />
            <tooltip-button
              v-if="editContent == false"
              bottom
              icon="mdi-pencil"
              :tooltip="$t('meetings.unlock')"
              @on="editContent = true"
            />
          </template>
        </div>
        <div class="list">
          <h1 class="meeting-main-title">
            {{ meeting.name }}
          </h1>

          <div
            v-if="$vuetify.breakpoint.smAndDown"
            class="meeting-main-subtitle"
          >
            <div class="meeting-date">
              <v-icon class="mr-2">
                mdi-clock
              </v-icon>
              {{ meetingInterval }}
            </div>
          </div>
          <div v-if="meeting.description" v-html="meeting.description" />
          <h2>{{ $t("meetings.agenda.agenda") }}</h2>
          <rich-editor
            v-model="meeting.agenda"
            :class="{ editor: true, edition: editContent }"
            hide-toolbar
            autofocus
            :editable="editContent"
            permission-object="meeting"
            :permission-id="meeting._id"
            :collaboration="`${meeting._id}-agenda`"
            @on-focus="setCurrentEditor"
          />
          <h2>
            {{ $t("meetings.report.report") }}
          </h2>
          <rich-editor
            v-model="meeting.report"
            :class="{ editor: true, edition: editContent }"
            hide-toolbar
            :editable="editContent"
            permission-object="meeting"
            :permission-id="meeting._id"
            :collaboration="`${meeting._id}-report`"
            @on-focus="setCurrentEditor"
          />
          <template v-if="hasDocuments">
            <h2 class="documents-title" @click="showDocuments = !showDocuments">
              {{ $t("meetings.documents.documents") }}
              <v-icon
                :class="['documents-chevron', showDocuments ? 'active' : null]"
              >
                mdi-chevron-down
              </v-icon>
            </h2>
            <div v-show="showDocuments" class="content documents">
              <attachments
                :label="$t('meetings.attachments.meetingAttachments')"
                :attachments="attachments"
              />
            </div>
          </template>
          <h2>
            {{ $t("meetings.actions.title") }}
          </h2>
          <div class="content actions">
            <meeting-actions-table
              :editable="editContent"
              :actions="actions"
              :tasks="tasks"
              @select-task="selectTask"
              @add-new-action="addNewAction"
              @save-action="saveAction"
              @unlink-task="saveAction"
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
import { Meteor } from "meteor/meteor";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { mapState } from "vuex";
import DatesMixin from "/imports/ui/mixins/DatesMixin";
import debounce from "lodash/debounce";
import MeetingExport from "/imports/ui/meetings/MeetingExport";
import MeetingActionsTable from "/imports/ui/meetings/MeetingActions/MeetingActionsTable";
import MeetingUtils from "/imports/api/meetings/utils";
import Attachments from "/imports/ui/attachments/Attachments";
import deepCopy from "/imports/ui/utils/deepCopy";
import Api from "/imports/api/Api";
import { Permissions } from "/imports/api/permissions/permissions";
import moment from "moment";

export default {
  components: {
    MeetingExport,
    MeetingActionsTable,
    Attachments
  },
  mixins: [DatesMixin],
  props: {
    meeting: {
      type: Object,
      default: null
    },
    project: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      editContent: false,
      currentEditor: null,
      selectedAction: null,
      showSelectDate: false,
      showSelectUser: false,
      showDocuments: false,
      showLock: false,
      showMeetingExport: false,
      actions: [],
      attachments: []
    };
  },
  computed: {
    ...mapState({
      currentUser: (state) => state.currentUser,
      meetingsRoute(state) {
        return state.storedRoutes["meetings-dashboard"]
          ? state.storedRoutes["meetings-dashboard"]
          : this.defaultMeetingsRoute;
      }
    }),
    defaultMeetingsRoute() {
      if (!this.project?._id) return null;
      return {
        name: "project-meetings",
        params: {
          projectId: this.project._id
        }
      };
    },
    selectedActionId() {
      if (!this.selectedAction?.actionId) return null;
      return this.selectedAction.actionId;
    },
    hasDocuments() {
      if (Meteor.settings.public.disableAttachments) {
        return false;
      }
      if (!this.meeting) return false;
      return (
        Array.isArray(this.meeting?.documents)
        && this.meeting.documents.length > 0
      );
    },
    meetingInterval() {
      if (!this.meeting) return "";
      return this.displayDateInterval({
        start: this.meeting.startDate,
        end: this.meeting.endDate,
        type: "dateWithHours"
      });
    }
  },
  watch: {
    "meeting.startDate": {
      immediate: true,
      handler(createdAt, previousCreatedAt) {
        if (previousCreatedAt?.getTime() === createdAt?.getTime()) {
          return;
        }
        const yesterday = moment().startOf("day").add(-1, "days").toDate();
        if (moment(createdAt).isBefore(yesterday)) {
          this.showLock = true;
          this.editContent = false;
        } else {
          this.showLock = false;
          this.editContent = true;
        }
      }
    },
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
        if (
          !Array.isArray(this.meeting?.documents)
          || !this.meeting.documents.length
        ) return;
        Api.call("attachments.find", {
          attachmentsIds: this.meeting.documents.map(
            (document) => document.documentId
          )
        }).then(
          (result) => {
            this.attachments = result.data;
          },
          (error) => {
            this.$notifyError(error);
          }
        );
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
        action.dueDate = moment(action.dueDate).format("YYYY-MM-DD HH:mm");
      }

      // update list before loading from server to avoid flickering
      const actionIndex = this.actions.findIndex(
        (a) => a.actionId === action.actionId
      );
      if (actionIndex > -1) {
        this.$set(this.actions, actionIndex, deepCopy(action));
      }

      await Api.call("meetings.updateAction", {
        meetingId: this.meeting._id,
        action: action
      }).catch((error) => {
        this.$notifyError(error);
      });

      await this.fetch();
    },
    chooseActionAssignedTo(action) {
      this.selectedAction = action;
      this.$nextTick(() => {
        this.showSelectUser = true;
      });
    },
    async selectActionAssignedTo(user) {
      if (!user) return;
      const action = {
        ...this.selectedAction,
        assignedTo: user._id
      };
      await this.saveAction(action);
      this.selectedAction = null;
      this.showSelectUser = false;
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
      }).then(
        () => {
          this.fetch();
        },
        (error) => {
          this.$notifyError(error);
        }
      );
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
        action?.dueDate
          ? moment(action.dueDate).format("YYYY-MM-DD HH:mm")
          : null
      ).catch(() => {
        this.$notifyError(this.$t("meetings.actions.createTaskFailed"));
      });

      await this.saveAction({ ...action, taskId: createdTask._id }).catch(
        () => {
          this.$notifyError(this.$t("meetings.actions.saveActionFailed"));
        }
      );
      this.$notify(this.$t("meetings.actions.createTaskSuccess"));
    },
    selectTask(task) {
      this.$store.dispatch("selectTask", task);
      this.$store.dispatch("showTaskDetail", true);
    },
    setCurrentEditor(editor) {
      if (this.showLock && !this.editContent) {
        return;
      }
      this.currentEditor = editor.editor;
    },
    editMeeting() {
      this.$emit("edit-meeting", this.meeting);
    },
    canManageProject() {
      return (
        Permissions.isAdmin(Meteor.userId(), this.meeting.projectId)
        || Permissions.isAdmin(Meteor.userId())
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.meeting-detail-card h2 {
  margin-bottom: 24px;
}

.meeting-main-title {
  margin: 1rem 0;
  line-height: normal;
}
.meeting-main-subtitle {
  margin-bottom: 1rem;
}

.meeting-date,
.meeting-date-header {
  display: flex;
  align-items: center;
  font-size: 14px;
  height: 100%;
}
.meeting-date {
  margin-bottom: 1rem;
}
.meeting-date-header {
  justify-content: flex-end;
}
.editor {
  color: black;
  font-size: 16px;
  line-height: 1.5;
  background-color: white;
  margin-bottom: 24px;
}

.edition {
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
  border: 2px solid black;
  border-radius: 4px;
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

.meeting-detail-card__toolbar {
  flex: 0;
  height: 100%;
  .v-toolbar__content {
    display: flex;
    justify-content: space-around;
  }

  .meeting-title-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .editor-header {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
}

.flex1 {
  flex: 1; /* takes the remaining height of the "container" div */
  overflow: auto; /* to scroll just the "main" div */
}

.list {
  max-width: 1200px;
  margin: 0 auto;
}

.content {
  width: 100%;
  cursor: text;
  background-color: white;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  transition: box-shadow 0.5s ease, opacity 0.5s ease,
    background-color 0.5s ease;
  font-size: 16px;
}
</style>
