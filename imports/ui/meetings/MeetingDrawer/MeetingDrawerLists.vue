<template>
  <div />
</template>
<script>
import { mapState } from "vuex";

export default {
  components: {},
  props: {
    user: {
      type: Object,
      default: null
    },
    organizationId: {
      type: String,
      default: null
    },
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {};
  }
};
</script>
