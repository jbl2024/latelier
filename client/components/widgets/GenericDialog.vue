<template>
  <div>
    <v-dialog
      v-model="showDialog"
      :max-width="maxWidth"
      :fullscreen="isFullscreen"
    >
      <v-card class="flex-container">
        <v-toolbar
          v-if="isFullscreen"
          dark
          color="primary"
          class="flex0"
        >
          <v-btn icon text @click="close()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>
            {{ title }}
          </v-toolbar-title>
          <v-spacer />
          <v-toolbar-items>
            <slot name="actions" />
          </v-toolbar-items>
        </v-toolbar>

        <v-card-title v-if="!isFullscreen" class="headline flex0">
          {{ title }}
        </v-card-title>
        <v-divider />
        <v-card-text class="flex1">
          <slot name="content" />
        </v-card-text>
        <v-divider />
        <v-card-actions v-if="!isFullscreen" class="flex0">
          <v-spacer />
          <v-btn text @click="close()">
            {{ closeLabel }}
          </v-btn>
          <slot name="actions" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: null
    },
    value: {
      type: Boolean,
      default: false
    },
    simple: {
      type: Boolean,
      default: false
    },
    maxWidth: {
      type: [Number, String],
      default: 420
    },
    closeLabel: {
      type: String,
      default: function () {
        return this.$t("Cancel");
      }
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
    },
    isFullscreen () {
      return this.$vuetify.breakpoint.xsOnly && !this.simple;
    }
  },
  methods: {
    close() {
      this.showDialog = false;
    }
  }
};
</script>

<style scoped>
.flex-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.flex0 {
  flex: 0;
  height: 100%;
}

.flex1 {
  flex: 1; /* takes the remaining height of the "container" div */
  overflow: auto; /* to scroll just the "main" div */
}

</style>
