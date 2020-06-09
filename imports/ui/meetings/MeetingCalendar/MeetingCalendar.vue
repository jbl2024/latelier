<template>
  <div>
    <v-calendar
      ref="calendar"
      v-model="selectedDate"
      class="meeting-calendar"
      :weekdays="calendarDatas.weekdays"
      :type="calendarDatas.displayType"
      :start="start"
      :min-weeks="minWeeks"
      :max-days="calendarDatas.maxDays"
      :now="now"
      :events="events"
      :locale="locale"
      :color="color"
      :short-weekdays="false"
      :short-months="false"
      @change="changeCalendar"
    />
  </div>
</template>
<script>
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import moment from "moment";

const weekdaysDefault = [1, 2, 3, 4, 5, 6, 0];
const fiveWeekdays = [1, 2, 3, 4, 5];
export default {
  mixins: [DatesMixin],
  props: {
    value: {
      type: String,
      default: null
    },
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
    events: {
      type: Array,
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
      nowMenu: false,
      minWeeks: 1
    };
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
    selectedDisplayType: {
      get() {
        return this.displayType;
      },
      set(newDisplayType) {
        this.$emit("update:display-type", newDisplayType);
      }
    },
    selectedDayNumber() {
      return moment(this.selectedDate).format("d");
    },
    calendarDatas() {
      switch (this.selectedDisplayType) {
        case "5days": {
          return {
            displayType: "week",
            maxDays: 5,
            weekdays: fiveWeekdays
          }
        }
        case "day": {
          return {
            displayType: this.selectedDisplayType,
            maxDays: 1,
            weekdays: weekdaysDefault
          }
        }
        default: {
          return {
            displayType: this.selectedDisplayType,
            maxDays: 7,
            weekdays: weekdaysDefault
          }
        }
      }
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
  },
  watch: {
    selectedDayNumber() {
      if (this.displayType === "5days" 
      && !fiveWeekdays.includes(parseInt(this.selectedDayNumber, 10))) {
        this.selectedDisplayType = "week";
      }
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
