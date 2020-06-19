<template>
  <div>
    <v-date-picker
      ref="datepicker"
      v-model="selectedDate"
      class="meeting-calendar-date-picker"
      :events="formattedEvents"
      :locale="locale"
      :picker-date.sync="selectedPickerDate"
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
    },
    pickerDate: {
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
    selectedPickerDate: {
      get() {
        return this.pickerDate;
      },
      set(newPickerDate) {
        this.$emit("update:picker-date", newPickerDate);
      }
    },
    inDateMode() {
      return this.$refs.datepicker.activePicker === "DATE";
    },
    formattedEvents() {
      if (!this.events) return null;
      return this.events.map((event) => moment(event.start).format("YYYY-MM-DD"));
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
