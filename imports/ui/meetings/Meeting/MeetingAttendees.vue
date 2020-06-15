<template>
  <div v-if="projectId" class="meeting-attendees">
    <v-container class="container">
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="filter"
            :label="$t('meetings.attendees.searchProjectUser')"
          />
        </v-col>
        <template v-if="users">
          <v-col v-for="user in users" :key="user._id" cols="3">
            <div class="meeting-attendee" @click="toggleAttendee(user)">
              <author-avatar
                v-if="!isAttendee(user)"
                :user-id="user"
              />
              <v-avatar v-else color="success">
                <v-icon dark>
                  mdi-check
                </v-icon>
              </v-avatar>
              <div class="meeting-attendee__name">
                {{ userFullname(user) }}
              </div>
            </div>
          </v-col>
        </template>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import debounce from "lodash/debounce";
import ApiProjects from "/imports/ui/api/projects/";

export default {
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      filter: "",
      page: 1,
      users: null,
      attendees: []
    };
  },
  computed: {
    userFullname: () => (user) => {
      if (!user?.profile) return "";
      return `${user.profile.firstName} ${user.profile.lastName}`;
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
        const results = await ApiProjects.findUsers({
          projectId: this.projectId,
          filter: this.filter
        });
        this.users = results;
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
    .meeting-attendee {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      cursor: pointer;
      .meeting-attendee__name {
        margin-top: 8px;
        font-size: 1.2rem;
      }
    }
  }
</style>
