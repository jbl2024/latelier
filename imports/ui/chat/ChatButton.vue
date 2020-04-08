<template>
  <div v-if="$store.state.chat.isEnabled && isConnected" class="chat-button">
    <v-btn icon @click="$emit('toggle-chat')">
        <v-icon>mdi-chat</v-icon>
    </v-btn>
  </div>
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
