<template>
  <v-toolbar
    :flat="flat"
    :dense="dense"
    :class="['meeting-calendar-toolbar', mobile ? 'mobile' : null]"
  >
    <template v-if="mobile">
      <div class="meeting-calendar-toolbar__mobile-content">
        <v-btn
          icon
          small
          class="prev-icon"
          @click="$emit('prev')"
        >
          <v-icon>
            mdi-chevron-left
          </v-icon>
        </v-btn>
        <div
          v-if="currentDateInterval"
          class="current-date-interval"
          @click.stop="$emit('click-current-date')"
        >
          <v-icon color="black" left>
            mdi-calendar-today
          </v-icon>
          <span>
            {{ currentDateInterval }}
          </span>
        </div>
        <v-btn
          icon
          small
          class="next-icon"
          @click="$emit('next')"
        >
          <v-icon>
            mdi-chevron-right
          </v-icon>
        </v-btn>
      </div>
    </template>
    <template v-else>
      <div class="left-side">
        <!-- Chevron for prev/next date -->
        <div class="time-navigation">
          <v-btn
            icon
            small
            class="prev-icon"
            @click="$emit('prev')"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            class="next-icon"
            @click="$emit('next')"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
        <v-btn
          v-if="isCalendarDisplay"
          outlined
          class="today-button"
          @click="$emit('set-today')"
        >
          {{ $t("calendar.today") }}
        </v-btn>
      </div>
      <div class="center">
        <div v-if="currentDateInterval" class="current-date-interval">
          <span>
            {{ currentDateInterval }}
          </span>
        </div>
      </div>
      <div class="right-side">
        <div v-if="displayType !== 'month'">
          <!-- Corporate week number -->
          <v-chip label>
            {{ $t("calendar.weekNumber", {weekNumber: weekNumber}) }}
          </v-chip>
          <!-- Switch between 24h and 7h start interval -->
          <v-btn
            v-if="isCalendarDisplay"
            class="first-interval-button"
            :outlined="firstInterval !== 0"
            :dark="firstInterval == 0"
            @click.native="toggleFirstInterval"
          >
            {{ $t("calendar.24h") }}
          </v-btn>
        </div>
      </div>
    </template>
  </v-toolbar>
</template>
<script>
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [DatesMixin],
  props: {
    value: {
      type: String,
      default: null
    },
    displayType: {
      type: String,
      default: null
    },
    displayTypes: {
      type: Array,
      default() {
        return [];
      }
    },
    start: {
      type: String,
      default: null
    },
    end: {
      type: String,
      default: null
    },
    flat: {
      type: Boolean,
      default: false
    },
    dense: {
      type: Boolean,
      default: true
    },
    mobile: {
      type: Boolean,
      default: false
    },
    firstInterval: {
      type: Number,
      default: 0
    }
  },
  computed: {
    weekNumber() {
      return this.getWeekNumber(
        this.displayType !== "list"
          ? this.start : this.selectedDate
      );
    },
    currentDateInterval() {
      if (this.isCalendarDisplay) {
        if (!this.start) return "";
        if (this.isCalendarDisplay && !this.end) return "";
        return this.displayDateInterval(
          {
            start: this.start,
            end: this.end,
            type: this.displayType
          }
        );
      } if (this.displayType === "list") {
        if (!this.selectedDate) return "";
        return this.displayDateInterval(
          {
            start: this.selectedDate,
            end: this.selectedDate,
            type: "day"
          }
        );
      }
      return "";
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
        if (!newDisplayType) return false;
        return this.$emit("update:display-type", newDisplayType);
      }
    },
    isCalendarDisplay() {
      const foundDisplayType = this.displayTypes.find(
        (displayType) => displayType.value === this.displayType
      );
      return foundDisplayType && foundDisplayType.type === "calendar";
    }
  },
  methods: {
    toggleFirstInterval() {
      this.$emit("update:first-interval", this.firstInterval === 7 ? 0 : 7);
    }
  }
};
</script>
<style lang="scss">
.meeting-calendar-toolbar {
  border-radius: 9px 9px 0 0;
  .right-side,
  .left-side {
    flex: 1 1 25%;
    display: flex;
    align-items: center;
  }
  .right-side {
    justify-content: flex-end;
  }
  .center {
    justify-content: center;
    flex: 1 1 50%;
  }
  flex: 0;
  & .v-toolbar__content {
    justify-content: space-between;
  }
  .time-navigation {
    margin-right: 8px;
  }
  .first-interval-button {
    margin-left: 1rem;
  }
  .current-date-interval {
    text-align: center;
    font-size: 1.2rem;
  }


  /* Mobile */

  &.mobile {
    border-radius: 0;
  }

  .meeting-calendar-toolbar__mobile-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    & .prev-icon {
      margin-right: 1rem;
    }
    & .next-icon {
      margin-left: 1rem;
    }
    & .current-date-interval {
      cursor: pointer;
    }
  }
}
</style>
