<template>
  <div class="administration-users elevation-1">
    <v-dialog
      v-model="showUserDetail"
      class="detail"
      max-width="640"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <user-detail :user="user" v-if="user" @close="closeDetail()" @saved="findUsers()"></user-detail>
    </v-dialog>
    <v-container>
      <v-layout row wrap="">
        <v-flex xs12 sm6>
          <v-text-field
            label="Recherche"
            single-line
            v-model="search"
            append-icon="search"
            clearable
            v-on:input="debouncedFilter"
          ></v-text-field>
        </v-flex>
      </v-layout>
    </v-container>
    <v-list dense subheader>
      <v-subheader inset>
        {{ pagination.totalItems}} utilisateurs
        <v-btn flat icon @click="showSelectUserDialog = true">
          <v-icon>add</v-icon>
        </v-btn>
      </v-subheader>
      <template v-for="user in users">
        <v-list-tile :key="user._id" avatar @click="openDetail(user)">
          <v-list-tile-avatar :color="isOnline(user)">
            <span>{{ formatUserLetters(user) }}</span>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title :class="getClass(user)">{{ formatUser(user) }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple @click.stop="removeUser(user)">
              <v-icon>delete</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </template>
    </v-list>
    <div class="text-xs-center">
      <v-pagination v-if="pagination.totalPages > 0" v-model="page" :length="pagination.totalPages"></v-pagination>
    </div>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Projects } from "/imports/api/projects/projects.js";
import { Permissions } from "/imports/api/users/permissions";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import debounce from "lodash/debounce";

export default {
  name: "administration-users",
  mixins: [usersMixin],
  mounted() {
    this.findUsers();
  },
  created() {
    this.debouncedFilter = debounce(val => {
      this.search = val;
    }, 400);
  },
  watch: {
    page(page) {
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
  props: {},
  data() {
    return {
      search: "",
      debouncedFilter: null,
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
  methods: {
    findUsers() {
      const users = Meteor.call(
        "admin.findUsers",
        this.page,
        this.search,
        (error, result) => {
          if (error) {
            console.log(error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = this.calculateTotalPages();

          this.users = result.data;
          this.users.map(user => {
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
        this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      )
        return 0;

      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    },

    openDetail(user) {
      this.user = user;
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
</style>