<template>
  <div class="select-hour-range">
    <generic-dialog
      v-model="showDialog"
      max-width="620"
      :title="computedTitle"
    >
      <template v-slot:content>
        <v-row justify="space-around" align="center">
          <v-col style="width: 290px; flex: 0 1 auto;">
            <v-time-picker
              v-model="selectedStart"
              :allowed-minutes="allowedMinutes"
              :allowed-hours="allowedHours"
              class="select-hour-range__picker"
              format="24hr"
            />
          </v-col>
          <v-col style="width: 290px; flex: 0 1 auto;">
            <v-time-picker
              v-model="selectedEnd"
              :allowed-minutes="allowedMinutes"
              :allowed-hours="allowedHours"
              :min="selectedStart"
              class="select-hour-range__picker"
              format="24hr"
            />
          </v-col>
        </v-row>
      </template>
      <template v-slot:actions>
        <v-btn text @click="selectHourRange">
          {{ $t("Select") }}
        </v-btn>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import moment from "moment";

export default {
  props: {
    value: {
      type: Boolean,
      default: null
    },
    allowedMinutes: {
      type: [Function, Array],
      default: null
    },
    allowedHours: {
      type: [Function, Array],
      default: null
    },
    start: {
      type: String,
      default: null
    },
    end: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      startValue: this.start,
      endValue: this.end
    };
  },
  computed: {
    selectedStart: {
      get() {
        return this.startValue;
      },
      set(newStart) {
        this.startValue = newStart;
        this.endValue = moment(this.startValue, "HH:mm").add(1, "hours").format("HH:mm");
      }
    },
    selectedEnd: {
      get() {
        return this.endValue;
      },
      set(newEnd) {
        this.endValue = newEnd;
      }
    },
    computedTitle() {
      if (this.startValue || this.endValue) {
        return this.$t("hoursRange.range", { start: this.startValue, end: this.endValue });
      }
      return this.$t("hoursRange.select");
    },
    showDialog: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  },
  watch: {
    start: {
      immediate: true,
      handler(val) {
        this.startValue = val;
      }
    },
    end: {
      immediate: true,
      handler(val) {
        this.endValue = val;
      }
    }
  },
  methods: {
    selectHourRange() {
      this.showDialog = false;
      this.$emit("select", { start: this.startValue, end: this.endValue });
    }
  }
};
</script>
<style lang="scss">
.select-hour-range {
  &__picker .v-time-picker-title {
    justify-content: center;
  }
}
</style>
