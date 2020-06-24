<template>
  <div v-if="projectId" class="meeting-attendees">
    <!-- List -->
    <meeting-attendees-list
      v-if="display === 'list'"
      v-model="selectedAttendees"
      :attendees="availableAttendees"
      :multiple="multiple"
    />
    <!-- Combobox -->
    <meeting-attendees-combobox
      v-else-if="display === 'combobox'"
      v-model="selectedAttendees"
      :items="availableAttendees"
      :label="$t('meetings.attendees.meetingAttendees')"
      :search.sync="filter"
      @add-new-attendee="addNewAttendee"
    />
  </div>
</template>
<script>
import debounce from "lodash/debounce";
import Api from "/imports/ui/api/Api";
import MeetingAttendeesCombobox from "./MeetingAttendeesCombobox";
import MeetingAttendeesList from "./MeetingAttendeesList";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import MeetingAttendeeMixin from "/imports/ui/mixins/MeetingAttendeeMixin.js";
import MeetingUtils from "/imports/api/meetings/utils";

export default {
  components: {
    MeetingAttendeesCombobox,
    MeetingAttendeesList
  },
  mixins: [MeetingAttendeeMixin, usersMixin],
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
    attendees: {
      type: Array,
      default() {
        return [];
      }
    },
    searchAttendeesOnly: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: true
    },
    display: {
      type: String,
      default: "list",
      validator: (display) => ["list", "combobox"].includes(display)
    }
  },
  data() {
    return {
      filter: "",
      createdAttendees: [],
      users: []
    };
  },
  computed: {
    selectedAttendees: {
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
    },
    usersParams() {
      const params = {
        projectId: this.projectId,
        filter: this.filter
      };
      if (this.searchAttendeesOnly === true
        && Array.isArray(this.attendees) && this.attendees.length
      ) {
        params.usersIds = this.attendees.map((attendee) => attendee.userId);
      }
      return params;
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
  beforeDestroy() {
    this.users = [];
  },
  methods: {
    getAttendeeName(attendee) {
      return MeetingUtils.getAttendeeName(attendee);
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
          this.usersParams
        );
        this.users = projectUsers;
      } catch (error) {
        this.$notify(error);
      }
    }
  }
};
</script>
