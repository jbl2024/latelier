<template>
  <!-- eslint-disable -->
  <div class="select-user">
    <v-dialog
      :value="active"
      max-width="620"
      @input="$emit('update:active')"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t("Select user") }}
        </v-card-title>
        <v-divider />
        <div>
          <v-tabs v-if="active" ref="tabs" class="select-user-tabs" grow>
            <v-tabs-slider color="accent" />
            <v-tab v-if="!hideProject && project">
              {{ $t("Project") }}
            </v-tab>
            <v-tab v-if="project && project.organizationId">
              {{ $t("Organization") }}
            </v-tab>
            <v-tab v-if="isAdmin">
              {{ $t("Find") }}
            </v-tab>
            <v-tab-item v-if="!hideProject && project" class="pa-4">
              <div class="flex-container">
                <div class="flex0" v-if="!$vuetify.breakpoint.xsOnly">
                  <v-text-field
                    :label="$t('Search') + '...'"
                    single-line
                    append-icon="mdi-magnify"
                    clearable
                    autofocus
                    @input="dfFilterProjectUsers"
                  />
                </div>
                <v-list class="flex1" subheader>
                  <template v-for="user in projectUsers">
                    <v-list-item :key="user._id" @click="selectUser(user)">
                      <v-list-item-avatar :color="isOnline(user)">
                        <author-avatar :user-id="user" />
                      </v-list-item-avatar>
                      <v-list-item-content class="pointer">
                        <v-list-item-title>
                          {{ formatUser(user) }}
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-list>
              </div>
            </v-tab-item>
            <v-tab-item v-if="project && project.organizationId" class="pa-4">
              <div class="flex-container">
                <div class="flex0" v-if="!$vuetify.breakpoint.xsOnly">
                  <v-text-field
                    :label="$t('Search') + '...'"
                    single-line
                    append-icon="mdi-magnify"
                    clearable
                    autofocus
                    @input="dfFilterOrganizationUsers"
                  />
                </div>
                <v-list class="flex1" subheader>
                  <template v-for="user in organizationUsers">
                    <v-list-item :key="user._id" @click="selectUser(user)">
                      <v-list-item-avatar :color="isOnline(user)">
                        <author-avatar :user-id="user" />
                      </v-list-item-avatar>
                      <v-list-item-content class="pointer">
                        <v-list-item-title>
                          {{ formatUser(user) }}
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-list>
              </div>
            </v-tab-item>

            <v-tab-item v-if="isAdmin" class="pa-4">
              <div class="flex-container">
                <div class="flex0">
                  <v-text-field
                    :label="$t('Search') + '...'"
                    single-line
                    append-icon="mdi-magnify"
                    clearable
                    autofocus
                    @input="debouncedFilter"
                  />
                </div>
                <template v-if="users.length > 0 && search.length > 0">
                  <div class="flex1">
                    <v-list subheader>
                      <template v-for="user in users">
                        <v-list-item :key="user._id" @click="selectUser(user)">
                          <v-list-item-avatar :color="isOnline(user)">
                            <author-avatar :user-id="user" />
                          </v-list-item-avatar>
                          <v-list-item-content>
                            <v-list-item-title>
                              {{ formatUser(user) }}
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </template>
                    </v-list>
                  </div>
                  <div class="flex0">
                    <div class="text-xs-center">
                      <v-pagination
                        v-if="pagination.totalPages > 0"
                        v-model="page"
                        :length="pagination.totalPages"
                      />
                    </div>
                  </div>
                </template>
                <template
                  v-if="
                    users.length === 0 && search.length > 0 && isEmail(search)
                  "
                >
                  <div class="flex1 invite">
                    <empty-state
                      :description="
                        $t('No user found, do you want to send an invitation?')
                      "
                      xs
                      illustration="empty"
                    >
                      <v-btn primary @click="sendInvitation(search)">
                        {{ $t("Send invitation") }}
                      </v-btn>
                    </empty-state>
                  </div>
                </template>
              </div>
            </v-tab-item>
          </v-tabs>
        </div>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">
            {{ this.$t("Cancel") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <!-- eslint-enable -->
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Organizations } from "/imports/api/organizations/organizations.js";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import debounce from "lodash/debounce";

export default {
  mixins: [usersMixin],
  i18n: {
    messages: {
      en: {
        "Select user": "Select user",
        "Available users": "Available users",
        Find: "Find",
        "Send invitation": "Send invitation",
        "Invite user?": "Invite user?",
        "Invitation sent": "Invitation sent",
        "No user found, do you want to send an invitation?":
          "No user found, do you want to send an invitation?"
      },
      fr: {
        "Select user": "Sélectionner un utilisateur",
        "Available users": "Utilisateurs disponibles",
        Find: "Rechercher",
        "Send invitation": "Envoyer une invitation",
        "Invite user?": "Inviter l'utilisateur ?",
        "Invitation sent": "Invitation envoyée",
        "No user found, do you want to send an invitation?":
          "Aucun utilisateur trouvé, voulez-vous envoyer une invitation ?"
      }
    }
  },
  props: {
    active: Boolean,
    hideProject: {
      type: Boolean,
      default: false
    },
    project: {
      type: Object,
      default: () => {}
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedTab: 0,
      search: "",
      searchProjectUsers: "",
      searchOrganizationUsers: "",
      debouncedFilter: null,
      dfFilterProjectUsers: null,
      dfFilterOrganizationUsers: null,
      users: [],
      user: null,
      showUserDetail: false,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      }
    };
  },
  computed: {
    projectUsers() {
      if (this.project) {
        const users = Meteor.users.find({ _id: { $in: this.project.members } }).fetch();
        if (!this.searchProjectUsers) {
          return users;
        }
        return users.filter((user) => {
          const email = user.emails[0].address;
          return email.toUpperCase().indexOf(this.searchProjectUsers.toUpperCase()) >= 0;
        });
      }
      return null;
    },
    organizationUsers() {
      if (this.project && this.project.organizationId) {
        const organization = Organizations.findOne(this.project.organizationId);
        if (organization) {
          const members = organization.members || [];
          const users = Meteor.users.find({ _id: { $in: members } }).fetch();
          if (!this.searchOrganizationUsers) {
            return users;
          }
          return users.filter((user) => {
            const email = user.emails[0].address;
            return email.toUpperCase().indexOf(this.searchOrganizationUsers.toUpperCase()) >= 0;
          });
        }
      }
      return null;
    }
  },
  watch: {
    page() {
      this.findUsers();
    },
    search() {
      if (this.page > 1) {
        this.page = 1;
      } else {
        this.findUsers();
      }
    }
  },
  created() {
    this.debouncedFilter = debounce((val) => {
      this.search = val;
    }, 400);
    this.dfFilterProjectUsers = debounce((val) => {
      this.searchProjectUsers = val;
    }, 400);
    this.dfFilterOrganizationUsers = debounce((val) => {
      this.searchOrganizationUsers = val;
    }, 400);
  },
  methods: {
    findUsers() {
      Meteor.call(
        "users.findUsers",
        this.page,
        this.search,
        (error, result) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = this.calculateTotalPages();

          this.users = result.data;
          this.users.forEach((user) => {
            if (!user.profile) {
              user.profile = {
                firstName: "",
                lastName: ""
              };
            }
          });
        }
      );
    },

    calculateTotalPages() {
      if (
        this.pagination.rowsPerPage == null
        || this.pagination.totalItems == null
      ) {
        return 0;
      }

      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    },

    closeDialog() {
      this.$emit("update:active", false);
    },

    selectUser(user) {
      this.$emit("update:active", false);
      this.$emit("select", user);
    },

    isEmail(email) {
      const re = /\S+@\S+\.\S+/;
      return re.test(email);
    },

    sendInvitation(email) {
      this.$confirm(this.$t("Invite user?"), {
        title: email,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Send invitation")
      }).then((res) => {
        if (res) {
          Meteor.call("users.invite", email, (error, result) => {
            if (error) {
              this.$notifyError(error);
              return;
            }
            this.$notify(this.$t("Invitation sent"));
            const user = result;

            this.$emit("update:active", false);
            this.$emit("select", user);

            this.findUsers();
          });
        }
      });
    }
  }
};
</script>

<style scoped>

.flex-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 300px;
}

.flex0 {
  flex: 0;
}

.flex1 {
  flex: 1;
  overflow-y: scroll;
}

.invite {
  margin-top: 24px;
  text-align: center;
}

</style>

<style>
.select-user-tabs .v-slide-group__prev {
  display: none !important;
}
</style>
