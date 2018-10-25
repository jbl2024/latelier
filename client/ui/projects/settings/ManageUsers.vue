<template>
  <div class="manage-users elevation-1">
    <select-user @select="onSelectUser" :project="project" :active.sync="showSelectUserDialog"></select-user>
    <v-list>
      <v-subheader>Membres
        <v-btn flat icon @click="showSelectUserDialog = true">
          <v-icon>add</v-icon>
        </v-btn>
      </v-subheader>
      <template v-for="user in projectUsers">
        <v-list-tile :key="user._id" avatar>
          <v-list-tile-avatar :color="isOnline(user)">
            <span class="">{{ formatUserLetters(user) }}</span>
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-title>{{ formatUser(user) }}</v-list-tile-title>
          </v-list-tile-content>

          <v-list-tile-action>
            <v-btn icon ripple @click.stop="removeUser(item._id)">
              <v-icon>delete</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </template>
    </v-list>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Projects } from "/imports/api/projects/projects.js";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";

export default {
  name: "project-settings-manage-users",
  mixins: [usersMixin],
  props: {
    project: Object
  },
  data() {
    return {
      showSelectUserDialog: false
    };
  },
  meteor: {
    $subscribe: {
      users: function() {
        return [];
      }
    },
    projectUsers: {
      params() {
        return {
          project: this.project
        };
      },
      deep: false,
      update({ project }) {
        if (project) {
          var members = project.members || [];
          return Meteor.users.find({ _id: { $in: members } });
        }
      }
    }
  },
  methods: {
    onSelectUser(user) {
      Meteor.call("projects.addMember", this.project._id, user._id);
    },

    removeUser(user) {
      Meteor.call("projects.removeMember", this.project._id, user._id);
    }
  }
};
</script>

<style scoped>
.manage-user {
  overflow-y: scroll;
}

.online {
  background-color: red;
}


.manage-users {
  margin-top: 12px;
}
</style>