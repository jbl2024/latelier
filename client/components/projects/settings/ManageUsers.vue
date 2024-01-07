<template>
  <div v-if="project && currentUser && projectUsers" class="manage-users">
    <select-user
      hide-project
      :project="project"
      :active.sync="showSelectUserDialog"
      :is-admin="canManageProject(project)"
      @select="onSelectUser"
    />
    <v-list class="list" two-line>
      <v-subheader>
        {{ $t("Members") }}
        <v-btn text icon @click="showSelectUserDialog = true">
          <v-icon>
            mdi-plus
          </v-icon>
        </v-btn>
      </v-subheader>
      <template v-for="user in projectUsers">
        <v-list-item :key="user._id">
          <v-list-item-avatar :color="isOnline(user)">
            <author-avatar :user-id="user" />
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{ formatUser(user) }}</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip v-if="user.isOwner" small color="purple" dark>
                {{ $t('project.owner') }}
              </v-chip>
              <v-chip v-if="user.inOrganization" small color="blue" dark>
                {{ $t('project.organizationMember') }}
              </v-chip>
              <v-chip v-if="isAdmin(user, project)" small color="red" dark>
                <v-avatar left>
                  <v-icon small>
                    mdi-security
                  </v-icon>
                </v-avatar>
                {{ $t('project.administrator') }}
              </v-chip>
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action
            v-if="
              canManageProject(project) &&
                !isAdmin(user, project) &&
                userId != user._id
            "
          >
            <v-tooltip top>
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
            <v-tooltip top>
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

          <v-list-item-action v-if="!user.inOrganization">
            <v-btn icon ripple @click.stop="removeUser(user)">
              <v-icon>
                mdi-delete
              </v-icon>
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
import { mapState } from "vuex";

export default {
  name: "ProjectSettingsManageUsers",
  mixins: [usersMixin],
  props: {
    project: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showSelectUserDialog: false,
      projectUsers: null
    };
  },
  computed: {
    ...mapState(["currentUser"])
  },
  meteor: {
    userId() {
      return Meteor.userId();
    }
  },
  watch: {
    project: {
      immediate: true,
      async handler() {
        await this.fetchUsers();
      }
    }
  },
  methods: {
    async onSelectUser(user) {
      try {
        await Meteor.callAsync("projects.addMember", {
          projectId: this.project._id,
          userId: user._id
        });
      } catch (error) {
        this.$notifyError(error.message);
      }
    },

    async removeUser(user) {
      try {
        await Meteor.callAsync("projects.removeMember", {
          projectId: this.project._id,
          userId: user._id
        });
      } catch (error) {
        this.$notifyError("Failed to remove user");
      }
    },

    isAdmin(user, project) {
      return (
        Permissions.isAdminSync(user, project._id)
        || Permissions.isAdminSync(user._id)
      );
    },

    canManageProject(project) {
      return (
        Permissions.isAdminSync(Meteor.userId(), project._id)
        || Permissions.isAdminSync(Meteor.userId())
      );
    },

    async setAdmin(user, project) {
      if (this.canManageProject(project)) {
        try {
          await Meteor.callAsync("permissions.setAdmin", { userId: user._id, scope: project._id });
          await this.fetchUsers();
        } catch (error) {
          this.$notifyError(error);
        }
      }
    },

    async removeAdmin(user, project) {
      if (this.canManageProject(project)) {
        try {
          await Meteor.callAsync("permissions.removeAdmin", { userId: user._id, scope: project._id });
          await this.fetchUsers();
        } catch (error) {
          this.$notifyError(error);
        }
      }
    },
    async fetchUsers() {
      this.projectUsers = await Meteor.callAsync(
        "projects.findUsers",
        { projectId: this.project._id }
      );
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
  padding-top: 8px;
  background-color: #e5e5e5;
}

.list {
  max-width: 800px;
  margin: 0 auto;
  margin-top: 24px;
  margin-bottom: 24px;
}

</style>
