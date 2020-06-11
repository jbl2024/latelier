<template>
  <v-card class="meeting-calendar-filters">
    <v-card-text>
      <v-checkbox 
        v-for="(type, key) in types"
        :key="key"
        v-model="selected"
        :value="type"
        color="accent"
        :label="$t(`meetings.types.${type}`)"
        hide-details
      />
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  props: {
    types: {
      type: Object,
      default: null
    },
    selectedTypes: {
      type: Array,
      default: null
    }
  },
  computed: {
    selected: {
      get() { 
        return this.selectedTypes;
      },
      set(newSelectedTypes) {
        this.$emit("update:selected-types", newSelectedTypes);
      }
    }
  }
}
</script>
<style lang="scss">
  .meeting-calendar-filters {
    &.v-card:not(.v-sheet--tile):not(.v-card--shaped) {
      border-radius: 9px;
    }
    background-color: white;
    .v-input--selection-controls {
      padding: 8px;
    }
  }

</style>