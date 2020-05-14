<template>
  <div class="organization-title">
    <v-toolbar-title>
      <v-btn text icon color="white" @click="$emit('go-home')">
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <span class="title">
        {{ truncatedTitle }}
      </span>
    </v-toolbar-title>
  </div>
</template>

<script>
import { truncate } from "/imports/ui/utils/truncate";

export default {
  props: {
    organization: {
      type: Object,
      default: null
    }
  },
  computed: {
    truncatedTitle() {
      if (!this.organization?.name) return "";
      return truncate(this.organization.name, 30);
    }
  }
};
</script>

<style scoped>
.organization-title {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
</style>
