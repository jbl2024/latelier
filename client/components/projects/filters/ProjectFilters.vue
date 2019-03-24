<template>
  <div class="compact-form">
    <v-autocomplete
      dense
      v-model="selectedAssignedTos"
      :items="users"
      :label="$t('Assigned to')"
      multiple
      :item-text="getEmailForUser"
      :item-value="getObjectForUser"
    >
      <template slot="selection" slot-scope="{item, index}">
        <div class="avatar" v-if="index === 0">
          <v-avatar size="24">
            <span>{{ formatUserLetters(item) }}</span>
          </v-avatar>
        </div>
        <span
          v-if="index === 1"
          class="grey--text caption"
        >(+{{ selectedAssignedTos.length - 1 }} others)</span>
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
        return this.$store.state.selectedAssignedTos;
      },
      set(value) {
        this.$store.dispatch("selectAssignedTos", value);
      }
    }
  },
  data: () => ({
    users: []
  }),
  meteor: {
    tasks() {
      this.refreshUsers();
      return Tasks.find();
    }
  },

  methods: {
    refreshUsers() {
      this.users = [];
      const userIds = [];
      const tasks = Tasks.find({ projectId: this.projectId });
      tasks.map(task => {
        if (task.assignedTo) {
          userIds.push(task.assignedTo);
        }
      });
      userIds.map(id => {
        if (typeof id !== "object") {
          this.users.push(Meteor.users.findOne({ _id: id }));
        } else {
          this.users.push(id);
        }
      });
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
.avatar .v-avatar {
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}

.compact-form {
  position: relative;
  top: 6px;
  transform: scale(0.875);
  transform-origin: left;
}
</style>