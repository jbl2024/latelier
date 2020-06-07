<template>
  <v-menu
    offset-y
  >
    <template v-slot:activator="{ on }">
      <v-btn
        text
        v-on="on"
      >
        <v-icon v-if="selectedType.icon" left>
          {{ selectedType.icon }}
        </v-icon>
        <span>
          {{ selectedType.text }}
        </span>
        <v-icon right>
          mdi-chevron-down
        </v-icon>
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item v-for="type in displayTypes" :key="type.value" @click="selectedType = type">
        <v-list-item-icon>
          <v-icon>
            {{ type.icon }}
          </v-icon>
        </v-list-item-icon>
        <v-list-item-title>
          {{ type.text }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
<script>
export default {
  props: {
    value: {
      type: String,
      default: "week"
    },
    displayTypes: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  computed: {
    selectedType: {
      get() {
        return this.displayTypes.find((type) => type.value === this.value);
      },
      set(newDisplayType) {
        if (!newDisplayType?.value) return false;
        return this.$emit("input", newDisplayType.value);
      }
    }
  }
};
</script>
