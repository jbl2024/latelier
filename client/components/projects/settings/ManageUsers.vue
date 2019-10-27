<template>
  <div class="manage-users elevation-1">
    <select-user
      hide-project
      :project="project"
      :active.sync="showSelectUserDialog"
      :is-admin="canManageProject(project)"
      @select="onSelectUser"
    />
    <v-list v-if="$subReady.user && $subReady.usersInProject">
      <v-subheader>
        {{ $t("Members") }}
        <v-btn text icon @click="showSelectUserDialog = true">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-subheader>
      <template v-for="user in projectUsers">
        <v-list-item :key="user._id">
          <v-list-item-avatar :color="isOnline(user)">
            <author-avatar :user-id="user" />
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{ formatUser(user) }}</v-list-item-title>
          </v-list-item-content>

          <v-list-item-action
            v-if="
              canManageProject(project) &&
                !isAdmin(user, project) &&
                userId != user._id
            "
          >
            <v-tooltip>
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  ripple
                  @click.stop="setAdmin(user, project)"
                  v-on="on"
                >
                  <v-icon color="grey">
                    mdi-security
                  </v-icon>
                </v-btn>
              </template>
              <span>{{ $t("Grant admin rights") }}</span>
            </v-tooltip>
          </v-list-item-action>

          <v-list-item-action
            v-if="
              canManageProject(project) &&
                isAdmin(user, project) &&
                userId != user._id
            "
          >
            <v-tooltip>
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  ripple
                  @click.stop="removeAdmin(user, project)"
                  v-on="on"
                >
                  <v-icon color="red">
                    mdi-security
                  </v-icon>
                </v-btn>
              </template>
              <span>{{ $t("Remove admin rights") }}</span>
            </v-tooltip>
          </v-list-item-action>

          <v-list-item-action>
            <v-btn icon ripple @click.stop="removeUser(user)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-list>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Permissions } from "/imports/api/permissions/permissions";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";

export default {
  name: "ProjectSettingsManageUsers",
  mixins: [usersMixin],
  props: {
    project: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      showSelectUserDialog: false
    };
  },
  meteor: {
    $subscribe: {
      usersInProject() {
        return [this.project._id];
      },
      user() {
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
          const members = project.members || [];
          return Meteor.users.find({ _id: { $in: members } });
        }
        return null;
      }
    },
    userId() {
      return Meteor.userId();
    }
  },
  methods: {
    onSelectUser(user) {
      Meteor.call("projects.addMember", {
        projectId: this.project._id,
        userId: user._id
      });
    },

    removeUser(user) {
      Meteor.call("projects.removeMember", {
        projectId: this.project._id,
        userId: user._id
      });
    },

    isAdmin(user, project) {
      return (
        Permissions.isAdmin(user._id, project._id)
        || Permissions.isAdmin(user._id)
      );
    },

    canManageProject(project) {
      return (
        Permissions.isAdmin(Meteor.userId(), project._id)
        || Permissions.isAdmin(Meteor.userId())
      );
    },

    setAdmin(user, project) {
      if (this.canManageProject(project)) {
        Permissions.methods.setAdmin.call(
          { userId: user._id, scope: project._id },
          (error) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
            }
          }
        );
      }
    },

    removeAdmin(user, project) {
      if (this.canManageProject(project)) {
        Permissions.methods.removeAdmin.call(
          { userId: user._id, scope: project._id },
          (error) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
            }
          }
        );
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
