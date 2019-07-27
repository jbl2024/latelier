<template>
  <div class="organization-settings-manage-users">
    <select-user @select="onSelectUser" :active.sync="showSelectUserDialog" :is-admin="canManageOrganization(organization)"></select-user>
    <div class="elevation-1 users">
      <v-list v-if="$subReady.user && $subReady.usersInOrganization">
        <v-subheader>{{ $t('Members') }}
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

            <v-list-tile-action v-if="canManageOrganization(organization) && !isAdmin(user, organization) && userId != user._id">
              <v-tooltip top slot="activator">
                <v-btn icon ripple @click.stop="setAdmin(user, organization)" slot="activator">
                  <v-icon color="grey">security</v-icon>
                </v-btn>
                <span>{{ $t('Grant admin rights') }}</span>
              </v-tooltip>
            </v-list-tile-action>

            <v-list-tile-action v-if="canManageOrganization(organization) && isAdmin(user, organization) && userId != user._id">
              <v-tooltip top slot="activator">
                <v-btn icon ripple @click.stop="removeAdmin(user, organization)" slot="activator">
                  <v-icon color="red">security</v-icon>
                </v-btn>
                <span>{{ $t('Remove admin rights') }}</span>
              </v-tooltip>
            </v-list-tile-action>

            <v-list-tile-action>
              <v-btn icon ripple @click.stop="removeUser(user)">
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
import { Permissions } from "/imports/api/permissions/permissions"
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
      usersInOrganization: function() {
        return [this.organization._id];
      },
      user: function() {
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
    },
    userId() {
      return Meteor.userId()
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
    },

    isAdmin(user, organization) {
      return Permissions.isAdmin(user._id, organization._id) || Permissions.isAdmin(user._id);
    },

    canManageOrganization(organization) {
      if (Permissions.isAdmin(Meteor.userId(), organization._id) || Permissions.isAdmin(Meteor.userId())) {
        return true;
      }
      return false;
    },

    setAdmin(user, organization) {
      if (this.canManageOrganization(organization)) {
        Permissions.methods.setAdmin.call({userId: user._id, scope: organization._id}, (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
        });
      }
    },

    removeAdmin(user, organization) {
      if (this.canManageOrganization(organization)) {
        Permissions.methods.removeAdmin.call({userId: user._id, scope: organization._id}, (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
        });
      }
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


.online {
  background-color: red;
}

.users {
  margin-top: 12px;
}
</style>