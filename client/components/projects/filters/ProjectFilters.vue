<template>
  <div>
    <v-autocomplete
      v-if="assignedUsers.length > 0"
      dense
      class="compact-form auto-complete"
      v-model="selectedAssignedTos"
      :items="assignedUsers"
      :label="$t('Assigned to')"
      multiple
      :no-data-text="$t('No user assigned')"
      :item-text="getEmailForUser"
      :item-value="getObjectForUser"
      menu-props="closeOnContentClick"
    >
      <template v-slot:selection="{ item, index }">
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
    <v-autocomplete
      v-if="updatedByUsers.length > 0"
      dense
      class="compact-form auto-complete"
      v-model="selectedUpdatedBy"
      :items="updatedByUsers"
      :label="$t('Updated by')"
      multiple
      :no-data-text="$t('No user found')"
      :item-text="getEmailForUser"
      :item-value="getObjectForUser"
      menu-props="closeOnContentClick"
    >
      <template v-slot:selection="{ item, index }">
        <div class="avatar" v-if="index <= 2">
          <v-avatar size="24" :color="isOnline(item)">
            <span>{{ formatUserLetters(item) }}</span>
          </v-avatar>
        </div>
        <span
          v-if="index > 2"
          class="grey--text caption"
        >(+{{ selectedUpdatedBy.length - 3 }} {{ $t('others') }})</span>
      </template>
    </v-autocomplete>
    <labels :projectId="projectId" mode="select" class="compact-form"></labels>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Tasks } from "/imports/api/tasks/tasks";
import { mapState } from "vuex";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";

const usersCache = {};

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
    },
    selectedUpdatedBy: {
      get() {
        return this.$store.state.projectFilters.selectedUpdatedBy;
      },
      set(value) {
        this.$store.dispatch("projectFilters/selectUpdatedBy", value);
      }
    }
  },
  data: () => ({
    assignedUsers: [],
    updatedByUsers: []
  }),
  meteor: {
    tasks() {
      this.refreshUsers();
      return Tasks.find();
    }
  },

  methods: {
    refreshUsers() {
      const loadUser = (id) => {
        if (typeof id !== "object") {
          const userObject = usersCache[id];
          if (userObject) return userObject;
          usersCache[id] = Meteor.users.findOne({ _id: id });
          return usersCache[id];
        }
      }

      this.assignedUsers = [];
      this.updatedByUsers = [];
      
      const assignedUserIds = [];
      const updatedByUserIds = [];

      const tasks = Tasks.find({ projectId: this.projectId });
      tasks.map(task => {
        if (task.assignedTo) {
          assignedUserIds.push(task.assignedTo);
          this.assignedUsers.push(loadUser(task.assignedTo));
        }
        if (task.updatedBy) {
          updatedByUserIds.push(task.updatedBy);
          this.updatedByUsers.push(loadUser(task.updatedBy));
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
  top: 10px;
  transform: scale(0.875);
  transform-origin: left;
}

.auto-complete, .labels {
  max-width: 200px;
  display: inline-block;
}


</style>

<style>
.v-autocomplete__content {
  z-index: 210 !important;
}
</style>