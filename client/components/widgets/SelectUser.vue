<template>
  <div class="select-user">
    <v-dialog
      :value="active"
      @input="$emit('update:active')"
      max-width="620"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <v-card>
        <v-card-title class="headline">{{ $t('Select user')}}</v-card-title>
        <v-card-text>
          <div class="flex-container">
            <div class="flex0">
              <v-text-field
                label="Recherche"
                single-line
                v-model="search"
                append-icon="search"
                clearable
                v-on:input="debouncedFilter"
              ></v-text-field>
            </div>
            <div class="flex1">
              <v-list dense subheader>
                <v-subheader>
                  {{ pagination.totalItems}} utilisateurs
                  <v-btn flat icon @click="$refs.newUser.open()">
                    <v-icon>add</v-icon>
                  </v-btn>
                </v-subheader>
                <template v-for="user in users">
                  <v-list-tile :key="user._id" avatar @click="selectUser(user)">
                    <v-list-tile-avatar :color="isOnline(user)">
                      <span>{{ formatUserLetters(user) }}</span>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                      <v-list-tile-title>{{ formatUser(user) }}</v-list-tile-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </template>
              </v-list>
            </div>
            <div class="flex0">
              <div class="text-xs-center">
                <v-pagination
                  v-if="pagination.totalPages > 0"
                  v-model="page"
                  :length="pagination.totalPages"
                ></v-pagination>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="closeDialog">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Projects } from "/imports/api/projects/projects.js";
import { Organizations } from "/imports/api/organizations/organizations.js";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import debounce from "lodash/debounce";

export default {
  mixins: [usersMixin],
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
  props: {
    active: Boolean,
    project: Object
  },
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
  meteor: {},
  methods: {
    findUsers() {
      const users = Meteor.call(
        "users.findUsers",
        this.page,
        this.search,
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
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

    closeDialog() {
      this.$emit("update:active", false);
    },

    selectUser(user) {
      this.$emit("update:active", false);
      this.$emit("select", user);
    }
  }
};
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
  overflow-y: scroll;
  max-height: 300px;
}

.cursor {
  cursor: pointer;
}

.cursor:hover {
  background-color: #aaa;
}

.avatar {
  background-color: rgba(0, 0, 0, 0.14);
  border-radius: 50%;
  width: 38px;
  height: 38px;
  padding-top: 8px;
}

.flex-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 400px;
}

.flex0 {
  flex: 0;
}

.flex1 {
  flex: 1;
  overflow-y: scroll;
}
</style>