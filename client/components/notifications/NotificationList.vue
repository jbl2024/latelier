<template>
  <v-list three-line dense class="pt-0">
    <v-list-tile
      @click="openDetail(notification)"
      v-for="notification in notifications"
      :key="notification._id"
    >
      <v-list-tile-avatar>
        <v-icon>{{ getIcon(notification) }}</v-icon>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-title :class="{ unread: !notification.read }">{{ notification.task.name }}</v-list-tile-title>
        <v-list-tile-sub-title>
          {{ $t(`history.${notification.type}`) }}
          <template
            v-if="notification.properties.user"
          >({{ formatUser(notification.properties.user) }} )</template>
        </v-list-tile-sub-title>
      </v-list-tile-content>
      <v-list-tile-action>
        <v-list-tile-action-text>{{ formatDateDuration(notification.createdAt) }}</v-list-tile-action-text>
        <v-btn icon ripple @click.stop="removeNotification(notification)">
          <v-icon color="grey lighten-1">close</v-icon>
        </v-btn>
      </v-list-tile-action>
    </v-list-tile>
  </v-list>
</template>

<script>
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import { NotificationTypes } from "/imports/api/notifications/notifications.js";

export default {
  mixins: [DatesMixin, usersMixin],
  props: {
    notifications: {
      type: Array
    },
    showNotificationCenterLink: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    openDetail(notification) {
      this.$router.push({
        name: "project-task",
        params: {
          projectId: notification.task.projectId,
          taskId: notification.task._id
        }
      });
      this.$emit("click");
    },
    removeNotification(notification) {
      Meteor.call(
        "notifications.remove",
        { notificationId: notification._id },
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.$emit("refresh");
          this.$store.dispatch("notify", this.$t("Notification deleted"));
        }
      );
    },

    getIcon(notification) {
      if (notification.type === NotificationTypes.TASK_REMINDER_START_DATE || notification.type === NotificationTypes.TASK_REMINDER_DUE_DATE) {
        return "alarm";
      } else {
        return "edit";
      }
    }
  }
};
</script>

<style scoped>
.unread {
  font-weight: bold;
}
</style>