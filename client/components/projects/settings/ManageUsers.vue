<template>
  <div class="manage-users elevation-1">
    <select-user hide-project @select="onSelectUser" :project="project" :active.sync="showSelectUserDialog" :is-admin="canManageProject(project)"></select-user>
    <v-list v-if="$subReady.user && $subReady.usersInProject">
      <v-subheader>{{ $t('Members') }}
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

          <v-list-tile-action v-if="canManageProject(project) && !isAdmin(user, project) && userId != user._id">
            <v-tooltip top slot="activator">
              <v-btn icon ripple @click.stop="setAdmin(user, project)" slot="activator">
                <v-icon color="grey">security</v-icon>
              </v-btn>
              <span>{{ $t('Grant admin rights') }}</span>
            </v-tooltip>
          </v-list-tile-action>

          <v-list-tile-action v-if="canManageProject(project) && isAdmin(user, project) && userId != user._id">
            <v-tooltip top slot="activator">
              <v-btn icon ripple @click.stop="removeAdmin(user, project)" slot="activator">
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
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Projects } from "/imports/api/projects/projects.js";
import { Permissions } from "/imports/api/permissions/permissions"
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
  i18n: {
    messages: {
      en: {
        "Grant admin rights": "Grant admin rights",
        "Remove admin rights": "Remove admin rights",
      },
      fr: {
        "Grant admin rights": "Donner les droits d'administration",
        "Remove admin rights": "Enlever les droits d'administration",
      }
    }
  },
  meteor: {
    $subscribe: {
      usersInProject: function() {
        return [this.project._id];
      },
      user: function() {
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
    },
    userId() {
      return Meteor.userId()
    }
  },
  methods: {
    onSelectUser(user) {
      Meteor.call("projects.addMember", {projectId: this.project._id, userId: user._id});
    },

    removeUser(user) {
      Meteor.call("projects.removeMember", {projectId: this.project._id, userId: user._id});
    },

    isAdmin(user, project) {
      return Permissions.isAdmin(user._id, project._id) || Permissions.isAdmin(user._id);
    },

    canManageProject(project) {
      return Permissions.isAdmin(Meteor.userId(), project._id) || Permissions.isAdmin(Meteor.userId());
    },

    setAdmin(user, project) {
      if (this.canManageProject(project)) {
        Permissions.methods.setAdmin.call({userId: user._id, scope: project._id}, (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
        });
      }
    },

    removeAdmin(user, project) {
      if (this.canManageProject(project)) {
        Permissions.methods.removeAdmin.call({userId: user._id, scope: project._id}, (error, result) => {
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

.online {
  background-color: red;
}


.manage-users {
  margin-top: 12px;
}
</style>