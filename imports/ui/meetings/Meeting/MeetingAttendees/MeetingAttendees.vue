<template>
  <div v-if="projectId" class="meeting-attendees">
    <v-container class="container">
      <v-row>
        <v-col cols="12">
          <meeting-attendees-selector
            v-model="attendees"
            :items="availableUsers"
            :label="$t('meetings.attendees.addAttendees')"
            :search.sync="filter"
            @add-created-attendee="addCreatedAttendee"
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

export default {
  components: {
    MeetingAttendeesSelector
  },
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
    availableUsers() {
      const availableUsers = this.users.concat(this.createdAttendees);
      availableUsers.sort((a, b) => {
        const aName = this.getUserFullname(a);
        const bName = this.getUserFullname(b);
        return aName.localeCompare(bName);
      })
      return availableUsers;
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
    getUserFullname: (user) => `${user?.profile?.firstName} ${user?.profile?.lastName}`,
    addCreatedAttendee(name) {
      const splittedName = name.split(" ");

      const attendeeUser = {
        isNew: true,
        _id: null,
        emails: [""],
        profile: {
          firstName: splittedName[0],
          lastName: splittedName[1] ? splittedName[1] : ""
        }
      };
      this.createdAttendees.push(attendeeUser);
      this.attendees.push(attendeeUser);
    },
    isAttendee(user) {
      const existingIndex = this.attendees.findIndex((attendee) => attendee._id === user._id);
      return existingIndex !== -1;
    },
    toggleAttendee(user) {
      if (this.isAttendee(user)) {
        this.removeAttendee(user);
      } else {
        this.addAttendee(user);
      }
    },
    addAttendee(user) {
      if (this.isAttendee(user)) return false;
      return this.attendees.push(user);
    },
    removeAttendee(user) {
      const existingIndex = this.attendees.findIndex((attendee) => attendee._id === user._id);
      if (existingIndex !== -1) {
        this.attendees.splice(existingIndex, 1);
      }
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
