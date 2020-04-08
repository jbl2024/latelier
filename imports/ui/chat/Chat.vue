<template>
  <div>
    <chat-channels-menu @select="selectChatChannel"/>
    <iframe class="chat-iframe" v-if="selectedChatChannelFullUrl" :src="selectedChatChannelFullUrl"></iframe>
  </div>
</template>
<script>
import ChatChannelsMenu from './ChatChannelsMenu';
import { mapGetters } from 'vuex';
export default {
  components: {
    ChatChannelsMenu
  },
  computed: {
    ...mapGetters('chat', [
      'selectedChatChannelFullUrl'
    ])
  },
  methods: {
    selectChatChannel(chatChannel) {
      this.$store.commit('chat/updateSelectedChatChannel', chatChannel)
    }
  }
}
</script>
<style scoped>
  .chat-iframe {
    width: 100%;
    height: 88vh;
    border: none;
  }
</style>