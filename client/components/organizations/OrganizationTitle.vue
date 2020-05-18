<template>
  <div class="organization-title">
    <span class="title">
      {{ truncatedTitle }}
    </span>
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
