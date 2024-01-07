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
                <v-icon>mdi-notification-clear-all</v-icon>
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
            full-height
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
              {{ $t("Close") }}
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
  async created() {
    this.debouncedLoad = debounce(async () => {
      const notificationIds = [];
      this.notifications.forEach((notification) => {
        if (!notification.read) notificationIds.push(notification._id);
      });
      if (notificationIds.length === 0) return;

      await Meteor.callAsync(
        "notifications.markAsRead",
        {
          notificationIds
        }
      );
      this.refresh();
    }, 2000);
  },
  methods: {
    close() {
      this.$emit("update:active", false);
    },
    async refresh() {
      this.loading = true;
      try {
        const result = await Meteor.callAsync("notifications.load", { page: this.page });
        this.pagination.totalItems = result.totalItems;
        this.pagination.rowsPerPage = result.rowsPerPage;
        this.pagination.totalPages = this.calculateTotalPages();
        this.notifications = result.data;
        this.debouncedLoad();
      } catch (error) {
        this.$notifyError(error);
      }
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

    async markAllAsRead() {
      try {
        await Meteor.callAsync("notifications.markAllAsRead");
        this.refresh();
      } catch (error) {
        this.$notifyError(error);
      }
    },

    async removeAll() {
      const res = await this.$confirm(this.$t("All notifications will be deleted"), {
        title: this.$t("Clear notifications?"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      });

      if (res) {
        try {
          await Meteor.callAsync("notifications.clear");
          this.refresh();
        } catch (error) {
          this.$notifyError(error);
        }
      }
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
