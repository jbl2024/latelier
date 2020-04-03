<template>
  <div v-if="isEnabled && isConnected" class="chat-button">
    <v-btn icon @click="$emit('toggle-chat')">
        <v-icon>mdi-chat</v-icon>
    </v-btn>
  </div>
</template>
<script>
export default {
  computed: {
    isEnabled() {
      if (!Meteor) return false;
      return Boolean(Meteor.settings.public?.chat?.enabled) === true;
    }
  },
  meteor: {
    isConnected() {
      return Meteor ? Meteor.userId() : false;
    }
  }
};
</script>
