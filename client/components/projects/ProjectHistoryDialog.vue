<template>
  <div>
    <generic-dialog v-model="showDialog" max-width="60%" :title="$t('History')">
      <template v-slot:content>
        <div class="content">
          <project-history v-if="showDialog" :project-id="projectId" />
        </div>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import ProjectHistory from "./ProjectHistory";

export default {
  components: {
    ProjectHistory
  },
  props: {
    projectId: {
      type: String,
      default: null
    },
    value: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    showDialog: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  }
};
</script>

<style scoped >
@media (max-width: 600px) {
  .content {
    overflow-y: auto;
  }
}

@media (min-width: 601px) {
  .content {
    overflow-y: auto;
    height: 420px;
  }

  .flex0 {
    flex: 0;
  }

  .flex1 {
    flex: 1; /* takes the remaining height of the "container" div */
    overflow: auto; /* to scroll just the "main" div */
  }
}
</style>
