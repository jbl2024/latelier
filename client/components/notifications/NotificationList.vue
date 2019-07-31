<template>
  <v-list three-line dense class="pt-0">
    <v-list-tile
      @click="openDetail(notification)"
      v-for="notification in notifications"
      :key="notification._id"
    >
      <v-list-tile-avatar>
        <v-icon>alarm</v-icon>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-title>{{ notification.task.name }}</v-list-tile-title>
        <v-list-tile-sub-title>{{ $t(`notifications.${notification.type}`) }}</v-list-tile-sub-title>
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

export default {
  mixins: [DatesMixin],
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
    },
    removeNotification(notification) {
      Meteor.call("notifications.remove", { notificationId: notification._id }, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.$emit("refresh");
        this.$store.dispatch("notify", this.$t("Notification deleted"));
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>