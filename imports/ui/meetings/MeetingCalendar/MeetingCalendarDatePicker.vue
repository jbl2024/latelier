<template>
  <div>
    <v-date-picker
      v-model="selectedDate"
      ref="datepicker"
      class="meeting-calendar-date-picker"
      :locale="locale"
      first-day-of-week="1"
      full-width
    />
  </div>
</template>
<script>
export default {
  props: {
    locale: {
      type: String,
      default: "en"
    },
    value: {
      type: String,
      default: null
    }
  },
  computed: {
    selectedDate: {
      get() {
        return this.value;
      },
      set(newDate) {
        this.$emit("input", newDate);
      }
    },
    inDateMode() {
      return this.$refs.datepicker.activePicker === "DATE";
    }
  }
};
</script>
<style lang="scss">
.meeting-calendar-date-picker {
  &.v-card:not(.v-sheet--tile):not(.v-card--shaped) {
    border-radius: 16px;
  }
}
</style>
