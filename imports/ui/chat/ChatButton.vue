<template>
  <v-btn v-if="$store.state.chat.isEnabled && isConnected" class="chat-button" icon @click="$emit('toggle-chat')">
      <v-icon>mdi-chat</v-icon>
  </v-btn>
</template>
<script>
export default {
  meteor: {
    isConnected() {
      return Meteor ? Meteor.userId() : false;
    }
  }
};
</script>
