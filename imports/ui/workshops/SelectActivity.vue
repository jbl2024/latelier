<template>
  <div>
    <v-dialog
      :value="active"
      max-width="820"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      @input="$emit('update:active')"
    >
      <v-card class="flex-container">
        <v-card-title class="headline">
          {{ $t("Select an activity") }}
        </v-card-title>

        <div class="flex0 search">
          <v-text-field
            v-model="search"
            :label="$t('Search') + '...'"
            single-line
            append-icon="mdi-magnify"
            clearable
            @input="debouncedFilter"
          />
        </div>

        <v-card-text class="flex1">
          <v-list class="content">
            <template v-for="activity in activities">
              <v-list-item :key="activity._id" @click="selectActivity(activity)">
                <v-list-item-content class="pointer">
                  <v-list-item-title>{{ activity.name }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list>
        </v-card-text>
        <div class="flex0">
          <div class="text-xs-center">
            <v-pagination
              v-if="active && pagination.totalPages > 1"
              v-model="page"
              :length="pagination.totalPages"
            />
          </div>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="closeDialog">
              {{ $t("Cancel") }}
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import debounce from "lodash/debounce";

export default {
  props: {
    active: Boolean
  },
  data() {
    return {
      search: "",
      debouncedFilter: null,
      activities: [],
      loading: true,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      }
    };
  },
  watch: {
    active(active) {
      if (active) {
        this.page = 1;
        this.refresh();
      }
    },
    search() {
      if (this.page > 1) {
        this.page = 1;
      } else {
        this.refresh();
      }
    },
    page() {
      this.refresh();
    }
  },
  created() {
    this.debouncedFilter = debounce((val) => {
      this.search = val;
    }, 400);
  },
  methods: {
    closeDialog() {
      this.$emit("update:active", false);
    },

    refresh() {
      this.loading = true;
      Meteor.call(
        "workshops.activities.find",
        { page: this.page, filter: this.search },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = result.totalPage;
          this.activities = result.data;
        }
      );
    },

    selectActivity(activity) {
      this.$emit("update:active", false);
      this.$emit("select", activity);
    }
  }
};
</script>

<style scoped>
.content {
  overflow-y: scroll;
}

.search {
  padding-left: 48px;
  padding-right: 48px;
}

@media (max-width: 600px) {
  .search {
    padding-left: 12px;
    padding-right: 12px;
  }
}

@media (min-width: 601px) {
  .flex-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 100px);
    min-height: 360px;
    max-height: 530px;
  }

  .flex0 {
    flex: 0;
  }

  .flex1 {
    flex: 1;
    overflow-y: scroll;
  }
}
</style>
