<template>
  <div>
    <generic-dialog
      v-model="showDialog"
      :css-classes="['meeting-edit']"
      :close-label="$t('Close')"
      max-width="600px"
    >
      <template #title>
        <meeting-title
          :title="computedTitle"
          :color="color"
          @click-color="showSelectColor = true"
        />
      </template>
      <template v-slot:content>
        <select-color :active.sync="showSelectColor" @select="onSelectColor" />
        <select-attachments
          :value="documents"
          :active.sync="showSelectDocuments"
          :project-id="currentProjectId"
          @select="onSelectAttachments"
        />
        <select-user
          v-if="currentProject"
          :project="currentProject"
          :active.sync="showSelectAttendees"
          :hide-organization="true"
          :hide-admin="true"
          :multiple="true"
          :is-admin="canManageProject()"
          :appended-tabs="[externalAttendeeTab]"
          @select-multiple="onSelectAttendees"
        >
          <template #title>
            {{ $t("meetings.attendees.selectAttendees") }}
          </template>
          <template #external-tab-item>
            <meeting-external-attendees
              v-model="externalAttendees"
              :transition="false"
              :reverse-transition="false"
            />
          </template>
        </select-user>
        <select-project
          v-if="canSelectProject"
          v-model="showSelectProject"
          :organization-id="organizationId"
          @select="onSelectProject"
        />
        <select-date
          v-model="showSelectDate"
          :disable-time="true"
          @select="onSelectDate"
        />
        <select-hour-range
          v-model="showSelectHourRange"
          :start="startHour"
          :end="endHour"
          :allowed-minutes="allowedMinutes"
          :allowed-hours="allowedHours"
          @select="onSelectHourRange"
        />
        <v-form v-model="valid" class="meeting-edit__form" @submit.prevent>
          <!-- Main infos and dates -->
          <meeting-infos
            :rules="rules"
            :name.sync="name"
            :type.sync="type"
            :description.sync="description"
            :date="date"
            :location.sync="location"
            :start-hour.sync="startHour"
            :end-hour.sync="endHour"
            :project.sync="selectedProject"
            :can-select-project="canSelectProject"
            @show-select-project="showSelectProject = true"
            @show-select-date="showSelectDate = true"
            @reset-date="date = null"
            @show-select-hour-range="showSelectHourRange = true"
            @reset-hour-range="resetHourRange"
          />
          <template v-if="currentProjectId">
            <!-- Attendees -->
            <div class="meeting-edit__attendees">
              <div
                class="meeting-edit__header"
                @click="showAttendeesSection = !showAttendeesSection"
              >
                <div class="meeting-edit__header-title">
                  <b>
                    {{ $t("meetings.attendees.attendees") }}
                  </b>
                  <v-avatar
                    v-if="attendees.length > 0"
                    :size="24"
                    color="success"
                  >
                    <span class="white--text">
                      {{ attendees.length }}
                    </span>
                  </v-avatar>
                </div>
                <v-icon
                  :class="[
                    'meeting-edit__chevron',
                    showAttendeesSection ? 'active' : null,
                  ]"
                >
                  mdi-chevron-down
                </v-icon>
              </div>
              <v-divider class="my-2" />
              <div v-show="showAttendeesSection">
                <meeting-attendees-list
                  :attendees="attendees"
                  :project-id="currentProjectId"
                  edit
                  @remove="removeAttendee"
                >
                  <template #list-prepend>
                    <v-list-item-group>
                      <v-list-item @click.stop="showSelectAttendees = true">
                        <v-list-item-icon>
                          <v-avatar size="40" :color="color">
                            <v-icon color="white" dark>
                              mdi-plus
                            </v-icon>
                          </v-avatar>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ $t("meetings.attendees.addAttendees") }}
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list-item-group>
                  </template>
                </meeting-attendees-list>
              </div>
            </div>

            <!-- Documents -->
            <div class="meeting-edit__documents">
              <div
                class="meeting-edit__header"
                @click="showDocumentsSection = !showDocumentsSection"
              >
                <div class="meeting-edit__header-title">
                  <b>
                    {{ $t("attachments.attachments") }}
                  </b>
                  <v-avatar
                    v-if="documents.length > 0"
                    :size="24"
                    color="success"
                  >
                    <span class="white--text">
                      {{ documents.length }}
                    </span>
                  </v-avatar>
                </div>
                <v-icon
                  :class="[
                    'meeting-edit__chevron',
                    showDocumentsSection ? 'active' : null,
                  ]"
                >
                  mdi-chevron-down
                </v-icon>
              </div>
              <v-divider class="my-2" />
              <div v-show="showDocumentsSection">
                <attachments
                  :attachments.sync="documents"
                  :label="$t('meetings.attachments.meetingAttachments')"
                  :two-line="false"
                  :per-page="4"
                >
                  <template #list-prepend>
                    <v-list-item-group>
                      <v-list-item @click.stop="showSelectDocuments = true">
                        <v-list-item-icon>
                          <v-avatar size="40" :color="color">
                            <v-icon color="white" dark>
                              mdi-plus
                            </v-icon>
                          </v-avatar>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ $t("attachments.addAttachments") }}
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list-item-group>
                  </template>
                  <template #item-actions="props">
                    <v-list-item-action>
                      <v-btn
                        icon
                        text
                        color="error"
                        @click.stop="removeDocument(props.item)"
                      >
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </template>
                </attachments>
              </div>
            </div>
          </template>
        </v-form>
      </template>
      <template v-slot:actions>
        <v-btn v-if="!isNewMeeting" color="error" @click="remove">
          {{ $t("meetings.remove") }}
        </v-btn>
        <v-btn
          v-if="isNewMeeting"
          :disabled="!isValid"
          color="success"
          :dark="isValid"
          @click="create"
        >
          {{ $t("meetings.create") }}
        </v-btn>
        <v-btn
          v-else
          :disabled="!isValid"
          color="success"
          :dark="isValid"
          @click="update"
        >
          {{ $t("meetings.update") }}
        </v-btn>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import MeetingInfos from "./MeetingInfos";
import MeetingAttendeesList from "./MeetingAttendees/MeetingAttendeesList";
import MeetingExternalAttendees from "./MeetingAttendees/MeetingExternalAttendees";
import MeetingTitle from "./MeetingTitle";
import moment from "moment";
import SelectHourRange from "/imports/ui/widgets/SelectHourRange";
import SelectAttachments from "/imports/ui/attachments/SelectAttachments.vue";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import MeetingUtils from "/imports/api/meetings/utils";
import { Permissions } from "/imports/api/permissions/permissions";
import Attachments from "/imports/ui/attachments/Attachments";
import Api from "/imports/api/Api";

export default {
  components: {
    MeetingInfos,
    MeetingAttendeesList,
    MeetingExternalAttendees,
    MeetingTitle,
    SelectHourRange,
    SelectAttachments,
    Attachments
  },
  mixins: [usersMixin],
  props: {
    project: {
      type: Object,
      default: null
    },
    organizationId: {
      type: String,
      default: null
    },
    projects: {
      type: Array,
      default() {
        return [];
      }
    },
    meeting: {
      type: Object,
      default: null
    },
    isShown: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentTab: null,
      allowedMinutes: Object.freeze([0, 10, 15, 30, 45]),
      allowedHours: Object.freeze([
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20
      ]),
      showSelectDate: false,
      showSelectHourRange: false,
      showSelectColor: false,
      showSelectProject: false,
      showSelectAttendees: false,
      showSelectDocuments: false,
      showAttendeesSection: false,
      showDocumentsSection: false,
      externalAttendeeTab: {
        id: "external",
        text: this.$t("meetings.attendees.external"),
        icon: "mdi-account-multiple-plus-outline",
        active: true
      },
      valid: false,
      agenda: null,
      color: null,
      location: null,
      name: null,
      type: null,
      description: null,
      date: null,
      startHour: null,
      endHour: null,
      selectedProject: null,
      attendees: [],
      externalAttendees: [],
      documents: [],
      rules: {
        name: [
          (v) => !!v || this.$t("Name is mandatory"),
          (v) => v.length > 1 || this.$t("Name is too short")
        ],
        project: [(v) => !!v || this.$t("meetings.pleaseSelectProject")]
      }
    };
  },
  computed: {
    canSelectProject() {
      return Boolean(this.organizationId && this.isNewMeeting);
    },
    currentProjectId() {
      const selectedProjectId = this.selectedProject?._id
        ? this.selectedProject?._id
        : null;
      if (this.canSelectProject) return selectedProjectId;
      if (this.project?._id) return this.project._id;
      return this.meeting?.projectId ? this.meeting.projectId : null;
    },
    currentProject() {
      if (this.organizationId) {
        if (this.isNewMeeting) return this.selectedProject;
        if (this.organizationId && this.projects.length) {
          return this.projects.find((p) => this.meeting.projectId === p._id);
        }
      }
      return this.project;
    },
    isValid() {
      const hasDate = Boolean(this.date);
      return this.valid && hasDate;
    },
    showDialog: {
      get() {
        return this.isShown;
      },
      set(isShown) {
        this.$emit("update:is-shown", isShown);
      }
    },
    isNewMeeting() {
      return Boolean(this.meeting?._id) === false;
    },
    computedTitle() {
      return this.name == null || this.name === ""
        ? this.$t("meetings.newMeeting")
        : this.name;
    }
  },
  watch: {
    meeting: {
      immediate: true,
      async handler() {
        this.assignMeetingProps();
        if (!this.attendees.length) {
          this.showAttendeesSection = true;
        }
        if (!this.documents.length) {
          this.showDocumentsSection = true;
        }
        await this.fetchSelectedDocuments();
      }
    },
    showSelectAttendees: {
      immediate: true,
      handler(val) {
        // We reset created attendees each time we select attendees
        if (val === true) {
          this.externalAttendees = [];
        }
      }
    }
  },
  methods: {
    assignMeetingProps() {
      const endDate = this.meeting?.endDate
        ? moment(this.meeting.endDate).format("YYYY-MM-DD HH:mm")
        : null;
      const startDate = this.meeting?.startDate
        ? moment(this.meeting.startDate).format("YYYY-MM-DD HH:mm")
        : null;
      const startHour = startDate ? startDate.split(" ")[1] : null;
      const endHour = endDate ? endDate.split(" ")[1] : null;

      // Mass assignment
      [
        "name",
        "attendees",
        "documents",
        "type",
        "description",
        "agenda",
        "color",
        "location"
      ].forEach((prop) => {
        if (prop in this && this.meeting && this.meeting[prop] != null) {
          this[prop] = this.meeting[prop];
        }
      });

      this.date = startDate;
      this.startHour = startHour;
      this.endHour = endHour;
    },
    async fetchSelectedDocuments() {
      if (this.isNewMeeting) return;
      if (!this.documents || !this.documents.length) return;
      const selectedDocumentsIds = this.documents.map((doc) => doc.documentId);
      const result = await Api.call("attachments.find", {
        attachmentsIds: selectedDocumentsIds
      });
      this.documents = result.data;
    },
    open() {
      this.showDialog = true;
    },
    close() {
      this.showDialog = false;
    },
    removeAttendee(attendee) {
      const index = this.attendees.find(
        (att) => att.attendeeId === attendee.attendeeId
      );
      if (index !== -1) {
        this.attendees.splice(index, 1);
      }
    },
    removeDocument(document) {
      const index = this.documents.findIndex((d) => d._id === document._id);
      if (index !== -1) {
        this.documents.splice(index, 1);
      }
    },
    onSelectAttendees(users) {
      if (!users || !Array.isArray(users)) return;
      const attendeesUsersIds = this.attendees.map((a) => a.userId);
      // We add new selected users with existing attendees
      const newUsers = Object.values(
        users.reduce((uniqueNewUsers, user) => {
          if (
            !attendeesUsersIds.includes(user._id)
            && !uniqueNewUsers[user._id]
          ) {
            uniqueNewUsers[user._id] = user;
          }
          return uniqueNewUsers;
        }, {})
      );
      this.attendees = this.attendees.concat(
        newUsers.map((u) => MeetingUtils.createUserAttendee(u)),
        this.externalAttendees.length ? this.externalAttendees : []
      );
      this.externalAttendees = [];
      this.showAttendeesSection = true;
    },
    onSelectAttachments(attachments) {
      this.documents = attachments;
      this.showSelectDocuments = false;
    },
    onSelectDate(date) {
      this.date = date;
    },
    onSelectHourRange({ start, end }) {
      this.startHour = start;
      this.endHour = end;
    },
    resetHourRange() {
      this.startHour = null;
      this.endHour = null;
    },
    onSelectColor(color) {
      const hex = color || this.color;
      this.color = hex;
    },
    async remove() {
      try {
        const res = await this.$confirm(this.$t("meetings.remove?"), {
          title: this.meeting.name,
          cancelText: this.$t("Cancel"),
          confirmText: this.$t("Delete")
        });
        if (res === null || res === false) return;
        this.showDialog = false;
        await Api.call("meetings.remove", { meetingId: this.meeting._id });
        this.$notify(this.$t("meetings.meetingDeleted"));
        this.$emit("removed");
      } catch (error) {
        this.$notifyError(error);
      }
    },
    getParams() {
      const date = moment(this.date).format("YYYY-MM-DD");
      const params = {
        name: this.name,
        projectId: this.currentProjectId,
        startDate: `${date} ${this.startHour}:00`,
        endDate: `${date} ${this.endHour}:00`,
        agenda: this.agenda,
        type: this.type,
        description: this.description,
        location: this.location,
        color: this.color,
        // We remove avatar picture (unwanted schema fields)
        attendees: this.attendees.map((attendee) => MeetingUtils.sanitizeAttendee(attendee)),
        documents: this.documents.map(MeetingUtils.formatAttachmentAsDocument)
      };
      if (!this.isNewMeeting) {
        delete params.projectId;
        params.id = this.meeting._id;
      }
      return params;
    },
    async update() {
      this.showDialog = false;
      await Api.call("meetings.update", this.getParams());
      this.$emit("updated");
      this.$notify(this.$t("meetings.updated"));
    },
    async create() {
      this.showDialog = false;
      const meetingId = await Api.call("meetings.create", this.getParams());
      this.$emit("created", meetingId);
      this.$notify(this.$t("meetings.created"));
    },
    onSelectProject(project) {
      this.selectedProject = project;
    },
    canManageProject() {
      return (
        Permissions.isAdmin(Meteor.userId(), this.currentProjectId)
        || Permissions.isAdmin(Meteor.userId())
      );
    }
  }
};
</script>

<style lang="scss">
.v-dialog > .meeting-edit.v-card > .v-card__text {
  padding: 0;
}
.meeting-edit {
  .meeting-edit__form {
    padding: 2rem;
  }
  .v-slide-group__wrapper {
    border-right: solid 1px #e0e0e0;
  }
  .date {
    margin-bottom: 24px;
  }
  .v-window-item {
    min-height: 600px;
  }
  .meeting-edit__tab.v-tab {
    justify-content: flex-start;
  }
  .meeting-edit__attendees {
    margin: 10px 0;
  }
  .meeting-edit__header {
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: space-between;
    font-size: 1rem;
  }
  .meeting-edit__header-title {
    width: 120px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .meeting-edit__chevron.active.v-icon {
    transform: rotate(-180deg);
  }
}
</style>
