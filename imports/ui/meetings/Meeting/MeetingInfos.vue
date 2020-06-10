<template>
  <v-container>
    <v-row>
      <v-col>
        <v-text-field
          v-model="meetingName"
          :rules="rules.name"
          :label="$t('Name')"
          required
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-list two-line class="elevation-1 date">
          <v-list-item @click="$emit('show-select-date')">
            <v-list-item-avatar>
              <v-icon>
                mdi-calendar-today
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="date-title">
                <span v-if="date">
                {{ $t("meetings.date.start", {date: formatDate(date)}) }}
                </span>
                <span v-else>
                  {{ $t("meetings.date.select") }}
                </span>
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn text icon @click.stop="$emit('reset-date')">
                <v-icon>
                  mdi-delete
                </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col cols="6">
        <v-list two-line class="elevation-1 date">
          <v-list-item @click="$emit('show-select-hour-range')">
            <v-list-item-avatar>
              <v-icon>
                mdi-clock
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="date-title">
                {{ selectedHoursTitle }}
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn text icon @click.stop="$emit('reset-hour-range')">
                <v-icon>
                  mdi-delete
                </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <label>{{ $t("Description") }}</label>
        <rich-editor
          ref="description"
          v-model="meetingDescription"
          :max-height="!$vuetify.breakpoint.xsOnly ? '200px' : null"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [DatesMixin],
  props: {
    rules: {
      type: Object,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    date: {
      type: String,
      default: null
    },
    startHour: {
      type: String,
      default: null
    },
    endHour: {
      type: String,
      default: null
    }
  },
  computed: {
    selectedHoursTitle() {
      if (this.selectedStartHour || this.selectedEndHour) {
        return this.$t("meetings.hoursRange.range", {
          start: this.selectedStartHour,
          end: this.selectedEndHour
        });
      } else {
        return this.$t("meetings.hoursRange.select");
      }
    },
    meetingName: {
      get() {
        return this.name;
      },
      set(newName) {
        this.$emit("update:name", newName);
      }
    },
    meetingDescription: {
      get() {
        return this.description;
      },
      set(newDescription) {
        this.$emit("update:description", newDescription);
      }
    },
    selectedStartHour: {
      get() {
        return this.startHour;
      },
      set(newStart) {
        return this.$emit("update:start-hour", newStart);
      }
    },
    selectedEndHour: {
      get() {
        return this.endHour;
      },
      set(newEnd) {
        return this.$emit("update:end-hour", newEnd);
      }
    }
  }
}
</script>
<style lang="scss">
  .date-title {
    font-size: 1.3rem;
  }
</style>