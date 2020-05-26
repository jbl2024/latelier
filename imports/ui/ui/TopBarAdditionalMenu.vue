<template>
  <div class="additional-menu">
    <v-btn
      v-shortkey="{single: ['/'], multiple: ['shift', '/']}"
      class="prevent-search-blur"
      icon
      @shortkey="$emit('toggle-search', !isSearchEnabled)"
      @click="$emit('toggle-search', !isSearchEnabled)"
    >
      <v-icon>mdi-magnify</v-icon>
    </v-btn>
    <notification-button />
    <v-avatar dark>
      <v-menu offset-y eager>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <author-avatar v-if="hasAvatar" small :user-id="currentUserId" />
            <v-icon v-if="!hasAvatar">
              mdi-account-circle
            </v-icon>
          </v-btn>
        </template>
        <login-menu />
      </v-menu>
    </v-avatar>
  </div>
</template>
<script>
import { mapState, mapGetters } from "vuex";

export default {
  props: {
    isSearchEnabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState(["currentUserId"]),
    ...mapGetters(["hasAvatar"])
  }
};
</script>
<style lang="scss" scoped>
  .additional-menu {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height:100;
    max-width: 100%;
  }
</style>
