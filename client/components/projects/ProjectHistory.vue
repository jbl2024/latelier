<template>
  <div class="project-history">
    <v-progress-linear v-if="loading" indeterminate />
    <v-list v-else two-line>
      <template v-for="item in history">
        <v-list-item :key="item._id">
          <v-list-item-avatar :color="isOnline(item.user)">
            <author-avatar :user-id="item.user" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="no-wrap">
              <span class="black--text">
                {{ item.properties.task.name }}
              </span>
            </v-list-item-title>
            <v-list-item-subtitle class="text--primary">
              {{ $t(`history.${item.type}`) }}
            </v-list-item-subtitle>
            <v-list-item-subtitle>
              <span class="grey--text">
                {{
                  $t("dates.duration.by", {
                    duration: formatDateDuration(item.createdAt),
                    user: item.user
                  })
                }}
              </span>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider :key="`history-divider-${item._id}`" inset />
      </template>
    </v-list>
    <div class="text-xs-center pb-2 flex0">
      <v-pagination
        v-if="pagination.totalPages > 0"
        v-model="page"
        :length="pagination.totalPages"
        :total-visible="6"
      />
    </div>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";

export default {
  mixins: [DatesMixin, usersMixin],
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      history: [],
      loading: true,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      }
    };
  },
  computed: {
    triggerRefresh() {
      return `${this.projectId}-${this.page}`;
    }
  },
  watch: {
    triggerRefresh: {
      immediate: true,
      handler() {
        this.refresh();
      }
    }
  },
  methods: {
    refresh() {
      Meteor.call(
        "projects.getHistory",
        { projectId: this.projectId, page: this.page },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = this.calculateTotalPages();
          this.history = result.data;
        }
      );
    },

    calculateTotalPages() {
      return this.pagination.rowsPerPage == null
        || this.pagination.totalItems == null
        ? 0
        : Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
    }
  }
};
</script>

<style scoped>

.project-history {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.task-name {
  font-weight: bold;
}
</style>
