<template>
  <div class="select-feature">
    <v-dialog
      :value="active"
      max-width="420"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      @input="$emit('update:active')"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t("projects.features.chooseFeature") }}
        </v-card-title>
        <v-card-text>
          <v-list class="content">
            <template v-for="feature in features">
              <v-list-item :key="feature.name" @click="selectFeature(feature)">
                <v-list-item-avatar v-if="feature.icon">
                  <v-icon>
                    {{ feature.icon }}
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-content class="cursor">
                  <v-list-item-title>
                    {{ feature.text }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">
            {{ $t("Cancel") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    active: Boolean,
    features: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  methods: {
    closeDialog() {
      this.$emit("update:active", false);
    },

    selectFeature(feature) {
      this.$emit("update:active", false);
      this.$emit("select", feature.name);
    }
  }
};
</script>

<style scoped>


.cursor {
  cursor: pointer;
}
</style>
