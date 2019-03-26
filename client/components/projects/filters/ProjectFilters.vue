<template>
  <div class="compact-form">
    <v-autocomplete
      v-if="assignedUsers.length > 0"
      dense
      class="auto-complete"
      v-model="selectedAssignedTos"
      :items="assignedUsers"
      :label="$t('Assigned to')"
      multiple
      :no-data-text="$t('No user assigned')"

      :item-text="getEmailForUser"
      :item-value="getObjectForUser"
      menu-props="closeOnContentClick"
    >
      <template slot="selection" slot-scope="{item, index}">

        <div class="avatar" v-if="index <= 2">
          <v-avatar size="24" :color="isOnline(item)">
            <span>{{ formatUserLetters(item) }}</span>
          </v-avatar>
        </div>
        <span
          v-if="index > 2"
          class="grey--text caption"
        >(+{{ selectedAssignedTos.length - 3 }} {{ $t('others') }})</span>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Tasks } from "/imports/api/tasks/tasks";
import { mapState } from "vuex";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";

export default {
  mixins: [usersMixin],
  props: {
    projectId: {
      type: String,
      default: 0
    }
  },
  computed: {
    selectedAssignedTos: {
      get() {
        return this.$store.state.projectFilters.selectedAssignedTos;
      },
      set(value) {
        this.$store.dispatch("projectFilters/selectAssignedTos", value);
      }
    }
  },
  data: () => ({
    assignedUsers: [],
    lastModificationUsers: []
  }),
  meteor: {
    tasks() {
      this.refreshUsers();
      return Tasks.find();
    }
  },

  methods: {
    refreshUsers() {
      const usersCache = {};
      const loadUser = (id) => {
        if (typeof id !== "object") {
          const userObject = usersCache.id;
          if (userObject) return userObject;
          usersCache.id = Meteor.users.findOne({ _id: id });
          return usersCache.id;
        }
      }

      this.assignedUsers = [];
      this.lastModificationUsers = [];
      
      const assignedUserIds = [];
      const lastModificationUserIds = [];

      const tasks = Tasks.find({ projectId: this.projectId });
      tasks.map(task => {
        if (task.assignedTo) {
          assignedUserIds.push(task.assignedTo);
          this.assignedUsers.push(loadUser(task.assignedTo));
        }
        if (task.updatedBy) {
          lastModificationUserIds.push(task.updatedBy);
          this.lastModificationUsers.push(loadUser(task.updatedBy));
        }
      });

      // clear previously assigned to not available now
      this.selectedAssignedTos = this.selectedAssignedTos.filter(selectedId => {
        return assignedUserIds.indexOf(selectedId) >= 0;
      })
    },

    getObjectForUser(item) {
      return item._id;
    }
  }
};
</script>

<style scoped>
.avatar {
  font-size: 11px;
  margin-top: 5px;
  margin-right: 12px;
}

.compact-form {
  position: relative;
  top: 7px;
  transform: scale(0.875);
  transform-origin: left;
}

.auto-complete {
  max-width: 200px;
}
</style>