<template>
  <div class="task-history">
    <generic-dialog v-model="showDialog" max-width="60%" :title="$t('History')">
      <template v-slot:content>
        <div class="content">
          <v-progress-linear v-if="loading" indeterminate />

          <v-timeline v-if="!loading" clipped dense>
            <v-timeline-item
              v-for="item in history"
              :key="item._id"
              color="indigo"
              :small="$vuetify.breakpoint.xsOnly"
            >
              <span slot="opposite" />
              <v-card class="elevation-2">
                <v-card-text>
                  <div>
                    {{ $t(`history.${item.type}`) }}
                    {{ formatDateDuration(item.createdAt) }} par {{ item.user }}
                  </div>
                </v-card-text>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </div>

        <div class="text-xs-center pb-2 flex0">
          <v-pagination
            v-if="showDialog && pagination.totalPages > 0"
            v-model="page"
            :length="pagination.totalPages"
          />
        </div>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [DatesMixin],
  props: {
    taskId: {
      type: String,
      default: ""
    },
    value: {
      type: Boolean,
      default: false
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
    showDialog: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  },
  watch: {
    showDialog(showDialog) {
      if (showDialog) {
        this.refresh();
      }
    },
    page() {
      this.refresh();
    }
  },
  methods: {
    refresh() {
      this.loading = true;
      Meteor.call(
        "tasks.getHistory",
        { taskId: this.taskId, page: this.page },
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
      if (
        this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      ) {
        return 0;
      }

      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    }
  }
};
</script>

<style scoped>
@media (max-width: 600px) {
  .content {
    overflow-y: auto;
  }
}

@media (min-width: 601px) {
  .content {
    overflow-y: auto;
    height: 420px;
  }

  .flex0 {
    flex: 0;
  }

  .flex1 {
    flex: 1; /* takes the remaining height of the "container" div */
    overflow: auto; /* to scroll just the "main" div */
  }
}
</style>
