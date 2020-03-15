<template>
  <div class="project-trashcan">
    <generic-dialog
      v-model="showDialog"
      max-width="640px"
      :title="$t('Trashcan')"
    >
      <template v-slot:content>
        <div class="content">
          <v-progress-linear v-if="loading" indeterminate />
          <empty-state
            v-if="tasks && tasks.length === 0 && !loading"
            :description="$t('No task')"
            small
            illustration="empty"
          />
          <v-list v-if="tasks && !loading">
            <template v-for="task in tasks">
              <v-list-item :key="task._id" @click="restoreTask(task)">
                <v-list-item-content>
                  <v-list-item-title>
                    #{{ task.number }} - {{ task.name }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        ripple
                        @click.stop="deleteForever(task)"
                        v-on="on"
                      >
                        <v-icon color="red">
                          mdi-delete-forever
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t("Delete forever") }}</span>
                  </v-tooltip>
                </v-list-item-action>
                <v-list-item-action>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        ripple
                        @click.stop="restoreTask(task)"
                        v-on="on"
                      >
                        <v-icon color="primary">
                          mdi-delete-restore
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t("Restore from trash") }}</span>
                  </v-tooltip>
                </v-list-item-action>
              </v-list-item>
              <v-divider :key="`divider-${task._id}`" />
            </template>
          </v-list>
        </div>

        <div class="text-xs-center flex0">
          <v-pagination
            v-if="pagination.totalPages > 0"
            v-model="page"
            :length="pagination.totalPages"
          />
        </div>
      </template>

      <template v-slot:actions>
        <v-btn text @click="flush()">
          {{ $t("Flush") }}
        </v-btn>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";

export default {
  mixins: [usersMixin, DatesMixin],
  props: {
    projectId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      showDialog: false,
      tasks: [],
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
    page() {
      this.refresh();
    }
  },
  methods: {
    open() {
      this.refresh();
      this.showDialog = true;
    },

    close() {
      this.showDialog = false;
    },

    refresh() {
      this.loading = true;
      Meteor.call(
        "projects.getDeletedTasks",
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
          this.tasks = result.data;
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
    },

    restoreTask(task) {
      Meteor.call("tasks.restore", task._id, (error) => {
        if (error) {
          this.$notifyError(error);
          return;
        }
        this.refresh();
      });
    },

    deleteForever(task) {
      this.$confirm(this.$t("Delete task?"), {
        title: task.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call("tasks.deleteForever", task._id, (error) => {
            if (error) {
              this.$notifyError(error);
              return;
            }
            this.$notify(this.$t("Task deleted"));
            this.refresh();
          });
        }
      });
    },

    flush() {
      this.$confirm(this.$t("Delete all tasks?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          this.loading = true;
          Meteor.call(
            "projects.flushTrashcan",
            { projectId: this.projectId },
            (error) => {
              this.loading = false;
              if (error) {
                this.$notifyError(error);
                return;
              }
              this.$notify(this.$t("Tasks deleted"));
              this.refresh();
            }
          );
        }
      });
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
    height: 300px;
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
