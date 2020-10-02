<template>
  <!-- eslint-disable -->
  <div class="select-user">
    <v-dialog
      v-model="showDialog"
      max-width="620"
    >
      <v-card>
        <v-card-title class="headline">
          <slot name="title">
            {{ $t("Select user") }}
          </slot>
        </v-card-title>
        <v-divider />
        <div>
          <v-tabs
            v-if="active"
            ref="tabs"
            class="select-user-tabs"
            grow
          >
            <v-tabs-slider color="accent" />
            <v-tab 
              v-for="tab in activeTabs"
              :key="tab.id"
              @click="selectedTab = tab.id"
            >
              <v-icon 
                v-if="tab.icon"
                left
              >
                {{ tab.icon }}
              </v-icon>
              {{ tab.text }}
            </v-tab>
          </v-tabs>
          <div
            v-if="selectedTab === 'project'"
            key="project-tab-item"
            class="pa-4"
            :transition="false" :reverse-transition="false"
          >
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
                <v-list-item-group
                  v-model="selectedItems"
                  :multiple="multiple"
                  active-class="success--text"
                >
                  <template v-for="user in projectUsers">
                    <v-list-item :key="user._id" @click="selectUser(user)">
                      <v-list-item-avatar
                        v-if="multiple && isSelected(user)"
                        color="success"
                      >
                        <v-icon color="white">
                          mdi-check
                        </v-icon>
                      </v-list-item-avatar>
                      <v-list-item-avatar
                        v-else
                        :color="isOnline(user)"
                      >
                        <author-avatar :user-id="user" />
                      </v-list-item-avatar>
                      <v-list-item-content class="pointer">
                        <v-list-item-title>
                          {{ formatUser(user) }}
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-list-item-group>
              </v-list>
            </div>
          </div>
          <div
            v-if="selectedTab === 'organization'"
            key="organization-tab-item"
            class="pa-4"
            :transition="false" :reverse-transition="false"
          >
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
                <v-list-item-group
                  v-model="selectedItems"
                  :multiple="multiple"
                  active-class="success--text"
                >
                  <template v-for="user in organizationUsers">
                    <v-list-item :key="user._id" @click="selectUser(user)">
                      <v-list-item-avatar
                        v-if="multiple && isSelected(user)"
                        color="success"
                      >
                        <v-icon color="white">
                          mdi-check
                        </v-icon>
                      </v-list-item-avatar>
                      <v-list-item-avatar
                        v-else
                        :color="isOnline(user)"
                      >
                        <author-avatar :user-id="user" />
                      </v-list-item-avatar>
                      <v-list-item-content class="pointer">
                        <v-list-item-title>
                          {{ formatUser(user) }}
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-list-item-group>
              </v-list>
            </div>
          </div>
          <div
            v-if="selectedTab === 'admin'"
            class="pa-4"
            key="admin-tab-item"
            :transition="false" :reverse-transition="false"
          >
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
                    <v-list-item-group
                      v-model="selectedItems"
                      :multiple="multiple"
                      active-class="success--text"
                    >
                      <template v-for="user in users">
                        <v-list-item :key="user._id" @click="selectUser(user)">
                          <v-list-item-avatar
                            v-if="multiple && isSelected(user)"
                            color="success"
                          >
                            <v-icon color="white">
                              mdi-check
                            </v-icon>
                          </v-list-item-avatar>
                          <v-list-item-avatar
                            v-else
                            :color="isOnline(user)"
                          >
                            <author-avatar :user-id="user" />
                          </v-list-item-avatar>
                          <v-list-item-content>
                            <v-list-item-title>
                              {{ formatUser(user) }}
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </template>
                    </v-list-item-group>
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
          </div>
          <!-- Appended tabs via appendedTabs + slots -->
          <template v-for="tab in activeAppendedTabs">
            <div
              v-show="selectedTab === tab.id"
              :key="`${tab.id}-tab-item`"
              class="pa-4"
              :transition="false"
              :reverse-transition="false"
            >
              <div class="flex-container">
                <slot :name="`${tab.id}-tab-item`" />
              </div>
            </div>
          </template>
        </div>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">
            {{ $t("Cancel") }}
          </v-btn>
          <v-btn v-if="multiple" color="success" dark @click="confirmSelectUsers">
            {{ $t("Select")}}
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
import { UserUtils } from "/imports/api/users/utils";
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
    active: {
      type: Boolean,
      default: false
    },
    hideProject: {
      type: Boolean,
      default: false
    },
    hideOrganization: {
      type: Boolean,
      default: false
    },
    hideAdmin: {
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
    },
    multiple: {
      type: Boolean,
      default: false
    },
    appendedTabs: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      search: "",
      searchProjectUsers: "",
      searchOrganizationUsers: "",
      debouncedFilter: null,
      dfFilterProjectUsers: null,
      dfFilterOrganizationUsers: null,
      selectedTab: null,
      selectedUsers: [],
      selectedItems: [],
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
    showDialog: {
      get() {
        return this.active;
      },
      set(active) {
        this.$emit("update:active", active);
      }
    },
    projectUsers() {
      if (this.project) {
        const members = this.project.members || [];
        const users = Meteor.users.find({ _id: { $in: members } }).fetch();
        if (!this.searchProjectUsers) {
          return users;
        }
        return users.filter((user) => {
          const email = UserUtils.getEmail(user);
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
            const email = UserUtils.getEmail(user);
            return email.toUpperCase().indexOf(this.searchOrganizationUsers.toUpperCase()) >= 0;
          });
        }
      }
      return null;
    },
    showProject() {
      return Boolean(!this.hideProject && this.project);
    },
    showOrganization() {
      return Boolean(!this.hideOrganization && this.project && this.project.organizationId);
    },
    showAdmin() {
      return Boolean(!this.hideAdmin && this.isAdmin);
    },
    activeAppendedTabs() {
      return this.appendedTabs.filter((tab) => tab.active);
    },
    activeTabs() {
      return [
        {
          id: "project",
          text: this.$t("Project"),
          icon: "mdi-clipboard-pulse-outline",
          active: this.showProject
        },
        {
          id: "organization",
          text: this.$t("Organization"),
          icon: "mdi-domain",
          active: this.showOrganization
        },
        {
          id: "admin",
          text: this.$t("Find"),
          icon: "mdi-magnify",
          active: this.showAdmin
        }
      ].filter((tab) => tab.active).concat(this.activeAppendedTabs);
    }
  },
  watch: {
    activeTabs: {
      immediate: true,
      handler() {
        if (Array.isArray(this.activeTabs) && this.activeTabs.length) {
          this.selectedTab = this.activeTabs[0]?.id;
        }
      }
    },
    active: {
      immediate: true,
      handler() {
        this.selectedUsers = [];
        this.selectedItems = [];
      }
    },
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
    getSelectedUserIndex(user) {
      return this.selectedUsers.findIndex((u) => u._id === user._id);
    },
    isSelected(user) {
      return this.getSelectedUserIndex(user) !== -1;
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
      this.showDialog = false;
    },

    selectUser(user) {
      if (this.multiple === true) {
        const index = this.getSelectedUserIndex(user);
        if (index === -1) {
          this.selectedUsers.push(user);
        } else {
          this.selectedUsers.splice(index, 1);
        }
      } else {
        this.showDialog = false;
        this.$emit("select", user);
      }
    },
    confirmSelectUsers() {
      this.showDialog = false;
      this.$emit("select-multiple", this.selectedUsers);
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
            this.showDialog = false;
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
