<template>
  <div class="administration-users elevation-1">
    <v-dialog
      v-model="showUserDetail"
      eager
      class="detail"
      max-width="640"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <user-detail ref="userDetail" @close="closeDetail()" @saved="findUsers()" />
    </v-dialog>
    <new-user ref="newUser" @created="findUsers()" />
    <v-container fluid class="filters">
      <v-layout row wrap>
        <v-flex xs12 sm6>
          <v-text-field
            v-model="search"
            :label="$t('Search') + '...'"
            single-line
            append-icon="mdi-magnify"
            clearable
            @input="debouncedFilter"
          />
        </v-flex>
        <v-flex sm6 />
        <v-flex xs12 sm3>
          <v-switch v-model="filterOnline" :label="$t('Online')" />
        </v-flex>
        <v-flex xs12 sm3>
          <v-switch v-model="filterAway" :label="$t('Away')" />
        </v-flex>
        <v-flex xs12 sm3 />
      </v-layout>
    </v-container>
    <v-list subheader>
      <v-subheader inset>
        {{ pagination.totalItems }} utilisateurs
        <v-btn text icon @click="$refs.newUser.open()">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-subheader>
      <template v-for="user in users">
        <v-list-item :key="user._id" @click="openDetail(user)">
          <v-list-item-avatar :color="isOnline(user)">
            <author-avatar :user-id="user" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title :class="getClass(user)">
              {{ formatUser(user) }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon ripple @click.stop="removeUser(user)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-list>
    <div class="text-xs-center">
      <v-pagination
        v-if="pagination.totalPages > 0"
        v-model="page"
        :length="pagination.totalPages"
      />
    </div>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Permissions } from "/imports/api/permissions/permissions";

import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import debounce from "lodash/debounce";

export default {
  name: "AdministrationUsers",
  mixins: [usersMixin],
  data() {
    return {
      search: "",
      debouncedFilter: null,
      users: [],
      showUserDetail: false,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      },
      filterOnline: false,
      filterAway: false
    };
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
    },
    filterOnline() {
      this.findUsers();
    },
    filterAway() {
      this.findUsers();
    }
  },
  mounted() {
    this.findUsers();
  },
  created() {
    this.debouncedFilter = debounce((val) => {
      this.search = val;
    }, 400);
  },
  i18n: {
    messages: {
      en: {
        "Delete user?": "Delete user?",
        "User deleted": "User deleted",
        Online: "Online",
        Away: "Away"
      },
      fr: {
        "Delete user?": "Supprimer l'utilisateur ?",
        "User deleted": "Utilisateur supprimé",
        Online: "En ligne",
        Away: "Absent"
      }
    }
  },
  methods: {
    findUsers() {
      Meteor.call(
        "admin.findUsers",
        this.page,
        this.search,
        this.filterOnline,
        this.filterAway,
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
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

    removeUser(user) {
      this.$confirm(this.$t("Delete user?"), {
        title: user.emails[0].address,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call("admin.removeUser", user._id, (error) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
              return;
            }
            this.$store.dispatch("notify", this.$t("User deleted"));
            this.findUsers();
          });
        }
      });
    },

    calculateTotalPages() {
      if (this.pagination.rowsPerPage == null || this.pagination.totalItems == null) {
        return 0;
      }
      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    },

    openDetail(user) {
      this.$refs.userDetail.open(user);
      this.showUserDetail = true;
    },

    closeDetail() {
      this.showUserDetail = false;
    },

    getClass(user) {
      if (!Permissions.isActive(user)) {
        return "deactivated";
      }
      return "";
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

.deactivated {
  text-decoration: line-through;
}

.filters {
  padding: 42px;
}
</style>
