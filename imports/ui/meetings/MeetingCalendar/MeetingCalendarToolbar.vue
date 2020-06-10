<template>
  <v-toolbar
    :flat="flat"
    :dense="dense"
    class="meeting-calendar-toolbar"
  >
    <div class="left-side">
      <!-- Chevron for prev/next date -->
      <div class="time-navigation">
        <v-btn
          icon
          class="prev-icon"
          @click="$emit('prev')"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn
          icon
          class="next-icon"
          @click="$emit('next')"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="center">
      <span v-if="currentDateInterval" class="current-date-interval">
        {{ currentDateInterval }}
      </span>
    </div>
    <!-- Switch between 24h and 7h start interval -->
    <div class="right-side">
      <v-btn
        class="first-interval-button"
        :outlined="firstInterval !== 0"
        :dark="firstInterval == 0"
        @click.native="toggleFirstInterval"
      >
        {{ $t("calendar.24h") }}
      </v-btn>
    </div>
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
    isCalendarActive: {
      type: Boolean,
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
    firstInterval: {
      type: Number,
      default: 0
    }
  },
  computed: {
    currentDateInterval() {
      if (!this.start || !this.end) return false;
      return this.displayDateInterval(
        {
          start: this.start,
          end: this.end,
          type: this.selectedDisplayType
        }
      );
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
  border-radius: 16px 16px 0 0;
  .right-side,
  .left-side {
    display: flex;
    align-items: center;
  }
  flex: 0;
  & .v-toolbar__content {
    justify-content: space-between;
  }
  .time-navigation {
    margin-right: 8px;
  }
  .next-icon + .prev-icon {
    margin-left: 0.25rem;
  }
  .first-interval-button {
    margin-left: 1rem;
  }
  .current-date-interval {
    font-size: 1.2rem;
  }
}
</style>
