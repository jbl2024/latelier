<template>
  <div>
    <v-date-picker
      v-model="selectedDate"
      ref="datepicker"
      class="meeting-calendar-date-picker"
      :events="formattedEvents"
      :locale="locale"
      first-day-of-week="1"
      full-width
    />
  </div>
</template>
<script>
import moment from "moment";

export default {
  props: {
    locale: {
      type: String,
      default: "en"
    },
    value: {
      type: String,
      default: null
    },
    events: {
      type: Array,
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
    },
    formattedEvents() {
      if (!this.events) return null;
      return this.events.map((event) => {
        return moment(event.start).format("YYYY-MM-DD");
      }) 
    }
  }
};
</script>
<style lang="scss">
.meeting-calendar-date-picker {
  &.v-card:not(.v-sheet--tile):not(.v-card--shaped) {
    border-radius: 9px;
  }
}
</style>
