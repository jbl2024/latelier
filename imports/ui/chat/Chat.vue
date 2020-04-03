<template>
  <div>
    <chat-channels-menu/>
    <iframe class="chat-iframe" v-if="fullUrl" :src="fullUrl"></iframe>
  </div>
</template>
<script>
import ChatChannelsMenu from './ChatChannelsMenu';
export default {
  components: {
    ChatChannelsMenu
  },
  computed: {
    isEnabled() {
      if (!Meteor) return false;
      return Boolean(Meteor.settings.public?.chat?.enabled) === true;
    },
    currentChannel() {
      return Meteor.settings.public?.chat?.rocketChat?.defaultChannel;
    },
    fullUrl() {
      if (!Meteor) return false;
      const url = Meteor.settings.public?.chat?.rocketChat?.baseUrl;
      if (!url) return false;
      return url + this.currentChannel + '?layout=embedded'
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