<template>
  <div class="notifications-dialog">
    <v-dialog
      :value="active"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      max-width="60%"
      @input="$emit('update:active')"
    >
      <v-toolbar dark color="primary">
        <v-btn
          v-shortkey="['esc']"
          icon
          text
          @click="close()"
          @shortkey="close()"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>
          {{ $t("Notifications") }}
        </v-toolbar-title>
        <v-spacer />
        <v-menu bottom left class="menu">
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="markAllAsRead()">
              <v-list-item-action>
                <v-icon>mdi-check</v-icon>
              </v-list-item-action>
              <v-list-item-title>
                {{ $t("Mark all as read") }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="removeAll()">
              <v-list-item-action>
                <v-icon>mdi-delete</v-icon>
              </v-list-item-action>
              <v-list-item-title>
                {{ $t("Clear notifications") }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar>
      <v-card class="flex-container">
        <v-card-text class="flex1">
          <empty-state
            v-if="!loading && pagination.totalPages == 0"
            class="empty-state"
            small
            :description="$t('No notification')"
            illustration="notifications_empty"
          />

          <notification-list
            :notifications="notifications"
            @refresh="refresh"
            @click="close"
          />
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
            <v-btn text @click="close()">
              {{ this.$t("Close") }}
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
      notifications: [],
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
      } else {
        this.debouncedLoad.cancel();
      }
    },
    page() {
      this.refresh();
    }
  },
  created() {
    this.debouncedLoad = debounce(() => {
      const notificationIds = [];
      this.notifications.forEach((notification) => {
        if (!notification.read) notificationIds.push(notification._id);
      });
      if (notificationIds.length === 0) return;

      Meteor.call(
        "notifications.markAsRead",
        {
          notificationIds
        },
        () => {
          this.refresh();
        }
      );
    }, 2000);
  },
  methods: {
    close() {
      this.$emit("update:active", false);
    },
    refresh() {
      this.loading = true;
      Meteor.call(
        "notifications.load",
        { page: this.page },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = this.calculateTotalPages();
          this.notifications = result.data;
          this.debouncedLoad();
        }
      );
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

    markAllAsRead() {
      Meteor.call("notifications.markAllAsRead", (error) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.refresh();
      });
    },

    removeAll() {
      this.$confirm(this.$t("All notifications will be deleted"), {
        title: this.$t("Clear notifications?"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call("notifications.clear", (error) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
              return;
            }
            this.refresh();
          });
        }
      });
    }
  }
};
</script>

<style scoped>
@media (min-width: 601px) {
  .flex-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 200px);
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

.empty-state {
  padding-top: 64px;
}
</style>
