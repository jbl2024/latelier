<template>
  <div>
    <meeting-calendar-contextual-menu
      v-model="showContextualMenu"
      :x="x"
      :y="y"
    >
      <v-list>
        <v-list-item @click="addNewMeetingOnTime">
          <v-list-item-title>
            {{ addMeetingText }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </meeting-calendar-contextual-menu>
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
      :interval-height="intervalHeight"
      :event-color="getEventColor"
      :locale="locale"
      :short-weekdays="false"
      :short-months="false"
      :first-interval="firstInterval"
      @contextmenu:time="showContextMenu"
      @click:event="selectEvent"
      @change="changeCalendar"
    >
      <template #event="{ event }">
        <div class="event">
          <div>
            {{ event.name }}
          </div>
          <div
            v-if="event.project && event.project.name"
            class="event-project-name"
          >
            {{ event.project.name }}
          </div>
          <b>
            {{ displayEventHours(event) }}
          </b>
        </div>
      </template>
    </v-calendar>
  </div>
</template>
<script>
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import MeetingCalendarContextualMenu from "/imports/ui/meetings/MeetingCalendar/MeetingCalendarContextualMenu";
import moment from "moment";

const weekdaysDefault = [1, 2, 3, 4, 5, 6, 0];
const fiveWeekdays = [1, 2, 3, 4, 5];
export default {
  components: {
    MeetingCalendarContextualMenu
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
      nowMenu: false,
      showContextualMenu: false,
      clickedTime: null,
      x: 0,
      y: 0,
      minWeeks: 1
    };
  },
  computed: {
    intervalHeight() {
      return this.firstInterval === 7 ? 70 : 48;
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
    addMeetingText() {
      const hour = this.clickedTime?.time ? this.clickedTime.time.split(":")[0] : "";
      return `Ajouter une réunion ${hour ? (`à ${hour}h`) : ""}`;
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
    selectedDayNumber() {
      if (this.displayType === "5days"
      && !fiveWeekdays.includes(parseInt(this.selectedDayNumber, 10))) {
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
    displayEventHours(event) {
      return `${moment(event.start).format("HH:mm")} - ${moment(event.end).format("HH:mm")}`;
    },
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
      return `${input.name} (${input?.project?.name ? input.project.name : ""})`;
    },
    showContextMenu(data) {
      this.clickedTime = data;
      this.showContextualMenu = true;
    },
    addNewMeetingOnTime() {
      this.$emit("add-new-meeting", this.clickedTime);
    },
    clickHandler(event) {
      this.x = event.clientX;
      this.y = event.clientY;
    }
  }
};
</script>
<style lang="scss">
  .meeting-calendar {
    .event {
      padding: 4px;
    }
    .event-project-name {
      font-size: 10px;
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
