<template>
  <v-menu v-model="isOpened" :close-on-content-click="true" offset-y>
    <template v-slot:activator="{ on }">
      <v-btn dark block tile v-on="on">
        {{ $store.state.chat.selectedChatChannel.name }}
      </v-btn>
    </template>
    <v-card>
      <div v-if="!$subReady.chatChannels">
        <v-progress-linear indeterminate />
      </div>
      <div v-if="$subReady.chatChannels">
        <v-list>
          <v-list-item @click="selectDefaultChatChannel">
            <v-list-item-title>Général</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list>
          <v-list-item
            @click="selectChatChannel(chatChannel)"
            v-for="(chatChannel, index) in chatChannels"
            :key="index"
          >
            <v-list-item-title>{{chatChannel.name}}</v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
    </v-card>
  </v-menu>
</template>
<script>
import { ChatChannels } from "/imports/api/chatChannels/chatChannels.js";
export default {
  data() {
    return {
      isOpened: false,
    }
  },
  meteor: {
    $subscribe: {
      chatChannels() {
        return [];
      }
    },
    chatChannels() {
      return ChatChannels.find(
        {},
        {
          sort: { name: 1 }
        }
      );
    }
  },
  methods: {
    selectDefaultChatChannel() {
      this.$emit('select', this.$store.state.chat.defaultChatChannel)
    },
    selectChatChannel(chatChannel) {
      this.$emit('select', chatChannel)
    },
  }
};
</script>