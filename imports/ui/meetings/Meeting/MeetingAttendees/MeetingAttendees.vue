<template>
  <div v-if="projectId" class="meeting-attendees">
    <v-container class="container">
      <v-row>
        <v-col cols="12">
          <meeting-attendees-selector
            v-model="attendees"
            :items="availableAttendees"
            :label="$t('meetings.attendees.addAttendees')"
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
import ApiProjects from "/imports/ui/api/projects/";
import MeetingAttendeesSelector from "./MeetingAttendeesSelector";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import MeetingUtils from "/imports/api/meetings/utils";

export default {
  components: {
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
    attendees: {
      get() {
        return this.value;
      },
      set(newAttendees) {
        this.$emit("input", newAttendees);
      }
    },
    availableAttendees() {
      const availableAttendees = MeetingUtils.formatUsersAsAttendees(this.users).concat(this.createdAttendees);
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
    addNewAttendee(name) {
      const attendee = MeetingUtils.createNewAttendee(name);
      this.createdAttendees.push(attendee);
      this.attendees.push(attendee);
    },
    async fetchUsers() {
      try {
        const projectUsers = await ApiProjects.findUsers({
          projectId: this.projectId,
          filter: this.filter
        });
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
    .container {
      padding: 2rem 3rem;
    }
    .meeting-attendees__col {
      justify-content: center;
    }
  }
</style>
