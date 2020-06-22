<template>
  <div v-if="projectId" class="meeting-attendees">
    <v-list v-if="display === 'list'">
      <v-list-item v-for="attendee in attendees" :key="attendee.attendeeId">
        <v-list-item-avatar>
        <meeting-attendee-avatar
          :letters="createAttendeeLetters(attendee)"
          :avatar="attendee.avatar"
        />
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>
          {{ getAttendeeName(attendee) }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ `${isExternalAttendee(attendee) ?
            $t("meetings.attendees.isExternalAttendee") :
            $t("meetings.attendees.isProjectAttendee")}`
          }}
        </v-list-item-subtitle>
      </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-container v-else-if="display === 'selector'" fluid class="meeting-attendees__container">
      <v-row>
        <v-col cols="12">
          <meeting-attendees-selector
            v-model="attendees"
            :items="availableAttendees"
            :label="$t('meetings.attendees.meetingAttendees')"
            :search.sync="filter"
            @add-new-attendee="addNewAttendee"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import debounce from "lodash/debounce";
import Api from "/imports/ui/api/Api";
import MeetingAttendeeAvatar from "/imports/ui/meetings/Meeting/MeetingAttendees/MeetingAttendeeAvatar";
import MeetingAttendeesSelector from "./MeetingAttendeesSelector";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import MeetingUtils from "/imports/api/meetings/utils";

export default {
  components: {
    MeetingAttendeeAvatar,
    MeetingAttendeesSelector
  },
  mixins: [usersMixin],
  props: {
    projectId: {
      type: String,
      default: null
    },
    value: {
      type: Array,
      default() {
        return [];
      }
    },
    display: {
      type: String,
      default: "list",
      validator: (display) => ["list", "selector"].includes(display)
    },
  },
  data() {
    return {
      filter: "",
      createdAttendees: [],
      users: []
    };
  },
  computed: {
    attendees: {
      get() {
        return this.value;
      },
      set(newAttendees) {
        this.$emit("input", newAttendees);
      }
    },
    availableAttendees() {
      const availableAttendees = MeetingUtils
        .formatUsersAsAttendees(this.users)
        .concat(this.createdAttendees);
      availableAttendees.sort((a, b) => {
        const aName = MeetingUtils.getAttendeeName(a);
        const bName = MeetingUtils.getAttendeeName(b);
        return aName.localeCompare(bName);
      });
      return availableAttendees;
    }
  },
  watch: {
    projectId: {
      immediate: true,
      async handler() {
        await this.fetchUsers();
      }
    },
    filter: debounce(async function() {
      await this.fetchUsers();
    }, 400)
  },
  methods: {
    isExternalAttendee(attendee) {
      return attendee.userId == null;
    },
    getAttendeeName(attendee) {
      return MeetingUtils.getAttendeeName(attendee);
    },
    createAttendeeLetters(attendee) {
      return MeetingUtils.createAttendeeLetters(attendee);
    },
    addNewAttendee(name) {
      const attendee = MeetingUtils.createNewAttendee(name);
      this.createdAttendees.push(attendee);
      this.attendees.push(attendee);
    },
    async fetchUsers() {
      try {
        const projectUsers = await Api.call(
          "projects.findUsers",
          {
            projectId: this.projectId,
            filter: this.filter
          }
        );
        this.users = projectUsers;
      } catch (error) {
        this.$notify(error);
      }
    }
  }
};
</script>
<style lang="scss">
  .meeting-attendees {
    .container.meeting-attendees__container {
      padding: 0;
    }
    .meeting-attendees__col {
      justify-content: center;
    }
  }
</style>
