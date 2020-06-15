<template>
  <div class="select-hour-range">
    <generic-dialog
      v-model="showDialog"
      max-width="520"
      :title="computedTitle"
    >
      <template v-slot:content>
        <v-tabs v-if="showDialog" fixed-tabs>
          <v-tabs-slider color="accent" />
          <v-tab>
            Début
          </v-tab>
          <v-tab>
            Fin
          </v-tab>
          <!-- Start hour -->
          <v-tab-item
            :transition="false" :reverse-transition="false"
            class="pt-2 text-center"
          >
            <v-time-picker
              v-model="selectedStart"
              :allowed-minutes="allowedMinutes"
              :allowed-hours="allowedHours"
              class="select-hour-range__picker"
              format="24hr"
            />
          </v-tab-item>
          <!-- End hour -->
          <v-tab-item
            :transition="false" :reverse-transition="false"
            class="pt-2 text-center"
          >
            <v-time-picker
              v-model="selectedEnd"
              :allowed-minutes="allowedMinutes"
              :allowed-hours="allowedHours"
              :min="selectedStart"
              class="select-hour-range__picker"
              format="24hr"
            />
          </v-tab-item>
        </v-tabs>
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
      startValue: null,
      endValue: null
    };
  },
  computed: {
    selectedStart: {
      get() {
        return this.start;
      },
      set(newStart) {
        this.startValue = newStart;
      }
    },
    selectedEnd: {
      get() {
        return this.end;
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
