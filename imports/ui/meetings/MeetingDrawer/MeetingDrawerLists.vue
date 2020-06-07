<template>
  <div style="text-align: center; padding: 1rem;">
    Same drawer lists (Active meetings, attending, today etc) logic for meetings
    (WIP)
  </div>
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
