<template>
  <div>
    <v-calendar
      ref="calendar"
      v-model="selectedDate"
      class="meeting-calendar"
      :weekdays="computedWeekdays"
      :type="computedDisplayType"
      :start="start"
      :min-weeks="minWeeks"
      :max-days="maxDays"
      :now="now"
      :locale="locale"
      :color="color"
      :events="events"
      :short-weekdays="false"
      :short-months="false"
      @change="changeCalendar"
    />
  </div>
</template>
<script>
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

const weekdaysDefault = [1, 2, 3, 4, 5, 6, 0];
export default {
  mixins: [DatesMixin],
  props: {
    start: {
      type: String,
      default: null
    },
    end: {
      type: String,
      default: null
    },
    now: {
      type: String,
      default: null
    },
    displayType: {
      type: String,
      default: "week"
    },
    color: {
      type: String,
      default: "primary"
    },
    locale: {
      type: String,
      default: "en"
    }
  },
  data() {
    return {
      weekdays: weekdaysDefault,
      nowMenu: false,
      minWeeks: 1,
      events: [],
      maxDays: 7
    };
  },
  computed: {
    selectedDate: {
      get() {
        return this.start;
      },
      set(newDate) {
        this.$emit("update:start", newDate);
      }
    },
    computedWeekdays() {
      switch (this.displayType) {
        case "5days": {
          return [1, 2, 3, 4, 5];
        }
        default: {
          return this.weekdays;
        }
      };
    },
    computedDisplayType() {
      switch (this.displayType) {
        case "5days": {
          return "week";
        }
        default: {
          return this.displayType;
        }
      };
    }
  },
  methods: {
    changeCalendar(data) {
      this.$emit("update:start", data.start.date);
      this.$emit("update:end", data.end.date);
    },
    next() {
      this.$refs.calendar.next();
    },
    prev() {
      this.$refs.calendar.prev();
    }
  }
};
</script>
<style lang="scss">
  .meeting-calendar {
    &.theme--dark.v-calendar-daily,
    &.theme--light.v-calendar-daily {
      border-left: 0;
    }
    .v-calendar-daily__interval-text {
      text-align: center;
    }
    .v-calendar-daily_head-day-label .v-btn__content {
      font-size: 2rem;
    }
  }
</style>