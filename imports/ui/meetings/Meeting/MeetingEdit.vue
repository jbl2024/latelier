<template>
  <div>
    <select-color
      :active.sync="showSelectColor"
      @select="onSelectColor"
    />
    <generic-dialog
      v-model="showDialog"
      :css-classes="['meeting-edit']"
      max-width="600px"
    >
      <template #title>
        <meeting-title
          :title="computedTitle"
          :color="color"
          :documents-count="documents.length"
          :attendees-count="attendees.length"
          @click-color="showSelectColor = true"
        />
      </template>
      <template v-slot:content>
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
        <v-form
          v-model="valid"
          class="meeting-edit__form"
          @submit.prevent
        >
          <!-- Main infos and dates -->
          <meeting-infos
            :rules="rules"
            :types="types"
            :name.sync="name"
            :type.sync="type"
            :description.sync="description"
            :date="date"
            :location.sync="location"
            :start-hour.sync="startHour"
            :end-hour.sync="endHour"
            @show-select-date="showSelectDate = true"
            @reset-date="date = null"
            @show-select-hour-range="showSelectHourRange = true"
            @reset-hour-range="resetHourRange"
          />
          <!-- Attendees -->
          <meeting-attendees
            v-model="attendees"
            display="selector"
            class="pt-3"
            :project-id="projectId"
          />
          <!-- Documents -->
          <meeting-documents
            v-model="documents"
            :project-id="projectId"
          />
        </v-form>
      </template>
      <template v-slot:actions>
        <v-btn v-if="!isNewMeeting" color="error" @click="remove">
          {{ $t("meetings.remove") }}
        </v-btn>
        <v-btn v-if="isNewMeeting" text :disabled="!valid || !coherent" @click="create">
          {{ $t("meetings.create") }}
        </v-btn>
        <v-btn v-else text :disabled="!valid || !coherent" @click="update">
          {{ $t("meetings.update") }}
        </v-btn>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import MeetingInfos from "./MeetingInfos";
import MeetingAttendees from "./MeetingAttendees/MeetingAttendees";
import MeetingDocuments from "./MeetingDocuments/MeetingDocuments";
import MeetingTitle from "./MeetingTitle";
import moment from "moment";
import SelectHourRange from "/imports/ui/widgets/SelectHourRange";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import Api from "/imports/ui/api/Api";

export default {
  components: {
    MeetingInfos,
    MeetingAttendees,
    MeetingDocuments,
    MeetingTitle,
    SelectHourRange
  },
  mixins: [usersMixin],
  props: {
    projectId: {
      type: String,
      default: null
    },
    meeting: {
      type: Object,
      default: null
    },
    types: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      currentTab: null,
      allowedMinutes: Object.freeze([0, 10, 15, 30, 45]),
      allowedHours: Object.freeze([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]),
      showDialog: false,
      showSelectDate: false,
      showSelectHourRange: false,
      showSelectColor: false,
      coherent: false,
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
      attendees: [],
      documents: [],
      rules: {
        names: [
          (v) => !!v || this.$t("Name is mandatory"),
          (v) => v.length > 1 || this.$t("Name is too short")
        ]
      }
    };
  },
  computed: {
    isNewMeeting() {
      return !this.meeting || !this.meeting._id;
    },
    computedTitle() {
      return (this.name == null || this.name === "") ? this.$t("meetings.newMeeting") : this.name;
    }
  },
  methods: {
    open() {
      this.showDialog = true;
      this.$nextTick(() => {
        const endDate = this.meeting?.endDate ? moment(this.meeting.endDate).format("YYYY-MM-DD HH:mm") : null;
        const startDate = this.meeting?.startDate ? moment(this.meeting.startDate).format("YYYY-MM-DD HH:mm") : null;
        const startHour = startDate ? startDate.split(" ")[1] : null;
        const endHour = endDate ? endDate.split(" ")[1] : null;

        // Mass assignment
        ["name", "attendees", "documents", "type", "description", "agenda", "color", "location"].forEach((prop) => {
          if (prop in this && this.meeting && this.meeting[prop] != null) {
            this[prop] = this.meeting[prop];
          }
        });
        this.date = startDate;
        this.startHour = startHour;
        this.endHour = endHour;

        this.checkConsistency();
      });
    },
    close() {
      this.showDialog = false;
    },
    onSelectDate(date) {
      this.date = date;
      this.checkConsistency();
    },
    onSelectHourRange({ start, end }) {
      this.startHour = start;
      this.endHour = end;
    },
    resetHourRange() {
      this.startHour = null;
      this.endHour = null;
    },
    checkConsistency() {
      if (!this.date) {
        this.coherent = false;
        return;
      }
      this.coherent = true;
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
        await Api.call(
          "meetings.remove",
          { meetingId: this.meeting._id }
        );
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
        projectId: this.projectId,
        startDate: `${date} ${this.startHour}:00`,
        endDate: `${date} ${this.endHour}:00`,
        agenda: this.agenda,
        type: this.type,
        description: this.description,
        location: this.location,
        color: this.color,
        // We remove avatar picture (unwanted schema fields)
        attendees: this.attendees.map((attendee) => {
          const sanitzedAttendee = { ...attendee };
          delete sanitzedAttendee.avatar;
          return sanitzedAttendee;
        }),
        documents: this.documents.map((document) => ({
          documentId: document._id,
          name: document.name,
          type: document.type,
          userId: document.userId,
          storageType: "attachments"
        }))
      };
      if (!this.isNewMeeting && this.meeting._id) {
        delete params.projectId;
        params.id = this.meeting._id;
      }
      return params;
    },
    async update() {
      try {
        this.showDialog = false;
        await Api.call("meetings.update", this.getParams());
        this.$emit("updated");
        this.$notify(this.$t("meetings.updated"));
      } catch (error) {
        this.$notifyError(error);
      }
    },
    async create() {
      try {
        this.showDialog = false;
        await Api.call("meetings.create", this.getParams());
        this.$emit("created");
        this.$notify(this.$t("meetings.created"));
      } catch (error) {
        this.$notifyError(error);
      }
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
}
</style>
