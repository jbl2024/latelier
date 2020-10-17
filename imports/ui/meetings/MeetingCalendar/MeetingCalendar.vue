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
      :events="localEvents"
      event-overlap-mode="stack"
      :interval-height="intervalHeight"
      :event-color="getEventColor"
      :locale="locale"
      :short-weekdays="false"
      :short-months="false"
      :interval-count="24 - firstInterval"
      :first-interval="firstInterval"
      @click:event="selectEvent"
      @change="changeCalendar"
      @mousedown:event="startDrag"
      @mousedown:time="startTime"
      @mousemove:time="mouseMove"
      @mouseup:time="endDrag"
      @mouseleave.native="cancelDrag"
    >
      <template #event="{ event }">
        <meeting-calendar-event
          :event="event"
          :display-type="displayType"
          @move-up="$emit('event-move-up', $event)"
          @move-down="$emit('event-move-down', $event)"
        />
      </template>
    </v-calendar>
  </div>
</template>
<script>
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import MeetingCalendarEvent from "/imports/ui/meetings/MeetingCalendar/MeetingCalendarEvent";
import moment from "moment";

const weekdaysDefault = [1, 2, 3, 4, 5, 6, 0];
const fiveWeekdays = [1, 2, 3, 4, 5];
export default {
  components: {
    MeetingCalendarEvent
  },
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
    firstInterval: {
      type: Number,
      default: 7
    },
    locale: {
      type: String,
      default: "en"
    }
  },
  data() {
    return {
      minWeeks: 1,
      dragEvent: null,
      dragStart: null,
      createEvent: null,
      createStart: null,
      localEvents: []
    };
  },
  computed: {
    intervalHeight() {
      return this.firstInterval === 7 ? 70 : 58;
    },
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
          };
        }
        case "day": {
          return {
            displayType: this.selectedDisplayType,
            maxDays: 1,
            weekdays: weekdaysDefault
          };
        }
        default: {
          return {
            displayType: this.selectedDisplayType,
            maxDays: 7,
            weekdays: weekdaysDefault
          };
        }
      }
    }
  },
  watch: {
    events: {
      immediate: true,
      deep: true,
      handler(events) {
        this.localEvents = Array.from(events);
      }
    },
    selectedDayNumber() {
      if (
        this.displayType === "5days"
        && !fiveWeekdays.includes(parseInt(this.selectedDayNumber, 10))
      ) {
        this.selectedDisplayType = "week";
      }
    }
  },
  mounted() {
    this.$el.addEventListener("contextmenu", this.clickHandler);
  },
  beforeDestroy() {
    this.$el.removeEventListener("contextmenu", this.clickHandler);
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
    },
    selectEvent(data) {
      if (data?.event?.id) {
        this.$emit("select-event", data.event);
      }
    },
    getEventColor(event) {
      return event.color;
    },
    getEventName({ input }) {
      return `${input.name} (${
        input?.project?.name ? input.project.name : ""
      })`;
    },
    showContextMenu(data) {
      this.clickedTime = data;
      this.showContextualMenu = true;
    },
    clickHandler(event) {
      this.x = event.clientX;
      this.y = event.clientY;
    },

    startDrag({ event, timed }) {
      if (event && timed) {
        this.dragEvent = event;
      }
    },
    startTime(tms) {
      if (this.createEvent) {
        this.removeCreateEvent();
      }
      const mouse = this.toTime(tms);
      if (!this.dragEvent) {
        this.createStart = this.roundTime(mouse);
        this.createEvent = {
          name: this.$t("meetings.meeting"),
          color: "#9dbdf5",
          start: this.createStart,
          end: this.createStart,
          timed: true
        };
        this.localEvents.push(this.createEvent);
      }
    },
    mouseMove(tms) {
      const mouse = this.toTime(tms);
      if (!this.dragEvent && this.createEvent && this.createStart !== null) {
        const mouseRounded = this.roundTime(mouse, false);
        const min = Math.min(mouseRounded, this.createStart);
        const max = Math.max(mouseRounded, this.createStart);

        this.createEvent.start = min;
        this.createEvent.end = max;
      }
    },
    endDrag() {
      if (this.createEvent) {
        let isValid = true;
        const start = moment(this.createEvent.start);
        const end = moment(this.createEvent.end);

        if (start.isSame(end)) {
          isValid = false;
        }
        if (!start.startOf("day").isSame(end.startOf("day"))) {
          isValid = false;
        }

        if (isValid) {
          this.$emit("add-new-meeting", this.createEvent.start, this.createEvent.end);
        }
      }
      this.removeCreateEvent();
    },
    cancelDrag() {
      if (this.createEvent) {
        const i = this.localEvents.indexOf(this.createEvent);
        if (i !== -1) {
          this.localEvents.splice(i, 1);
        }
      }

      this.createEvent = null;
      this.createStart = null;
      this.dragEvent = null;
    },
    removeCreateEvent() {
      const i = this.localEvents.indexOf(this.createEvent);
      if (i !== -1) {
        this.localEvents.splice(i, 1);
      }
      this.createEvent = null;
    },
    roundTime(time, down = true) {
      const roundTo = 15; // minutes
      const roundDownTime = roundTo * 60 * 1000;

      return down
        ? time - (time % roundDownTime)
        : time + (roundDownTime - (time % roundDownTime));
    },
    toTime(tms) {
      return new Date(
        tms.year,
        tms.month - 1,
        tms.day,
        tms.hour,
        tms.minute
      ).getTime();
    }
  }
};
</script>
<style lang="scss">
.meeting-calendar {
  &.v-calendar .v-event-timed-container {
    margin-right: 0;
  }
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
