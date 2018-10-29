<template>
  <div class="administration-users elevation-1">
    <v-list dense subheader>
      <v-subheader inset>{{ pagination.totalItems}} utilisateurs
        <v-btn flat icon @click="showSelectUserDialog = true">
          <v-icon>add</v-icon>
        </v-btn>
      </v-subheader>
      <template v-for="user in users">
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
    <div class="text-xs-center">
      <v-pagination v-model="page" :length="pagination.totalPages"></v-pagination>
    </div>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Projects } from "/imports/api/projects/projects.js";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";

export default {
  name: "administration-users",
  mixins: [usersMixin],
  mounted() {
    this.findUsers();
  },
  watch: {
    page (page) {
      this.findUsers()
    }
  },
  props: {},
  data() {
    return {
      users: [],
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
      const users = Meteor.call("admin.findUsers", this.page, (error, result) => {
        if (error) {
          console.log(error);
          return;
        }
        this.pagination.totalItems = result.totalItems;
        this.pagination.rowsPerPage = result.rowsPerPage;
        this.pagination.totalPages = this.calculateTotalPages();

        this.users = result.data;
      });
    },

    calculateTotalPages () {
      if (this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      ) return 0

      return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage)
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