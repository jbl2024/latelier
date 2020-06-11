<template>
  <div class="meeting-infos">
    <select-color 
      :active.sync="showSelectColor"
      @select="onSelectColor"
    />
    <v-container>
      <v-row>
        <v-col cols="1">
          <div
            @click="showSelectColor = true"
            ref="color"
            class="meeting-color-trigger"
            :style="colorStyles"
          />
        </v-col>
        <v-col cols="11">
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
        <v-col cols>
          <v-select
            v-model="meetingType"
            :items="typesItems"
            :label="$t('meetings.type')"
          />
        </v-col>
        <v-col>
          <v-text-field
            v-model="meetingLocation"
            :label="$t('meetings.location')"
            required
          />
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
  </div>
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
    types: {
      type: Object,
      default: null
    },
    type: {
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
    color: {
      type: String,
      default: null
    },
    location: {
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
  data() {
    return {
      showSelectColor: false
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
    typesItems() {
      if (!this.types) return [];
      return Object.keys(this.types).map((key) => {
        return {value: this.types[key], text: this.$t(`meetings.types.${this.types[key]}`)}
      });
    },
    meetingType: {
      get() {
        return this.type;
      },
      set(newType) {
        this.$emit("update:type", newType);
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
    },
    meetingLocation: {
      get() {
        return this.location;
      },
      set(newLocation) {
        return this.$emit("update:location", newLocation);
      }
    },
    colorStyles() {
      return `background-color: ${this.meetingColor}`;
    },
    meetingColor: {
      get() {
        return this.color;
      },
      set(newColor) {
        return this.$emit("update:color", newColor);
      }
    },
  },
  methods: {
    onSelectColor(color) {
      const hex = color || this.meetingColor;
      this.meetingColor = hex;
    },
  }
}
</script>
<style lang="scss">
  .meeting-infos {
    .meeting-color-trigger {
      position: relative;
      top: 6px;
      border-radius: 50px;
      min-height: 44px;
      cursor: pointer;
    }
    .date-title {
      font-size: 1.3rem;
    }
  }
</style>