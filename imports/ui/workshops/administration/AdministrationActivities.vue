<template>
  <div class="elevation-1">
    <edit-activity ref="editActivity" @updated="findActivities()" />
    <new-activity ref="newActivity" @created="findActivities()" />
    <v-container fluid class="filters">
      <v-row>
        <v-col sm="12" md="6" xs="12">
          <v-text-field
            v-model="search"
            :label="$t('Search') + '...'"
            single-line
            append-icon="mdi-magnify"
            clearable
            @input="debouncedFilter"
          />
        </v-col>
      </v-row>
    </v-container>
    <v-list subheader>
      <v-subheader inset>
        {{ pagination.totalItems }} {{ $t('activities')}}
        <v-btn text icon @click="$refs.newActivity.open()">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-subheader>
      <template v-for="activity in activities">
        <v-list-item :key="activity._id" @click="editActivity(activity)">
          <v-list-item-content>
            <v-list-item-title>
              {{ activity.name }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon ripple @click.stop="removeUser(activity)">
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

import NewActivity from "../NewActivity.vue";
import EditActivity from "../EditActivity.vue";

export default {
  name: "AdministrationActivities",
  components: {
    NewActivity,
    EditActivity
  },
  mixins: [usersMixin],
  data() {
    return {
      search: "",
      debouncedFilter: null,
      activities: [],
      showUserDetail: false,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      },
      selectedActivity: {}
    };
  },
  watch: {
    page() {
      this.findActivities();
    },
    search() {
      if (this.page > 1) {
        this.page = 1;
      } else {
        this.findActivities();
      }
    },
    filterOnline() {
      this.findActivities();
    },
    filterAway() {
      this.findActivities();
    }
  },
  mounted() {
    this.findActivities();
  },
  created() {
    this.debouncedFilter = debounce((val) => {
      this.search = val;
    }, 400);
  },
  methods: {
    findActivities() {
      Meteor.call(
        "workshops.activities.find", {
          page: this.page,
          filter: this.search
        }, (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = result.totalPages;
          this.activities = result.data;
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
            this.findActivities();
          });
        }
      });
    },

    editActivity(activity) {
      this.$refs.editActivity.open(activity);
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
