<template>
  <div class="notification-button">
    <v-avatar dark v-if="isConnected && !$vuetify.breakpoint.xsOnly">
      <v-menu offset-y v-model="menu">
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-badge color="red" :value="notificationsCount > 0">
              <template v-slot:badge>
                <span>{{ notificationsCount }}</span>
              </template>
              <v-icon>notifications</v-icon>
            </v-badge>
          </v-btn>
        </template>
        <notifications-menu :shown="menu"></notifications-menu>
      </v-menu>
    </v-avatar>
    <v-avatar dark v-if="isConnected && $vuetify.breakpoint.xsOnly">
      <v-btn icon :to="{ name: 'notification-center-page' }">
        <v-badge color="red" :value="notificationsCount > 0">
          <template v-slot:badge>
            <span>{{ notificationsCount }}</span>
          </template>
          <v-icon>notifications</v-icon>
        </v-badge>
      </v-btn>
    </v-avatar>
  </div>
</template>

<script>

export default {
  data() {
    return {
      menu: false
    }
  },
  meteor: {
    isConnected() {
      if (Meteor) {
        return Meteor.userId();
      }
      return false;
    },
    notificationsCount() {
      if (Meteor) {
        const user = Meteor.user();
        if (user && user.notifications) {
          return user.notifications.count;
        }
      }
    },  
  },
};
</script>
