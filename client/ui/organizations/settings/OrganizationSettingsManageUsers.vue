<template>
  <div class="organization-settings-manage-users">
    <select-user @select="onSelectUser" :active.sync="showSelectUserDialog"></select-user>
    <div class="elevation-1 users">
      <v-list>
        <v-subheader>Membres
          <v-btn flat icon @click="showSelectUserDialog = true">
            <v-icon>add</v-icon>
          </v-btn>
        </v-subheader>
        <template v-for="user in organizationUsers">
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
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Organizations } from "/imports/api/organizations/organizations.js";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";

export default {
  name: "organization-settings-manage-users",
  mixins: [usersMixin],
  props: {
    organization: Object
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
    organizationUsers: {
      params() {
        return {
          organization: this.organization
        };
      },
      deep: false,
      update({ organization }) {
        if (organization) {
          var members = organization.members || [];
          return Meteor.users.find({ _id: { $in: members } });
        }
      }
    }
  },
  methods: {
    onSelectUser(user) {
      Meteor.call("organizations.addMember", this.organization._id, user._id);
    },

    removeUser(user) {
      Meteor.call(
        "organizations.removeMember",
        this.organization._id,
        user._id
      );
    }
  }
};
</script>

<style scoped>
.manage-user {
  overflow-y: scroll;
}

.toolbar {
  background-color: #2d6293;
}

.toolbar h3.md-title {
  color: white;
}

.online {
  background-color: red;
}

.users {
  margin-top: 12px;
}
</style>