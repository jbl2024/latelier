<template>
  <div class="meeting-infos">
    <v-container
      fluid
      class="meeting-infos__container"
    >
      <v-row>
        <v-col cols="12" class="py-0">
          <v-text-field
            v-model="meetingName"
            :rules="rules.name"
            :label="$t('Name')"
            required
          />
        </v-col>
      </v-row>
      <v-row v-if="canSelectProject">
        <v-col cols="12" class="py-0">
          <v-text-field
            :value="projectName"
            :rules="rules.project"
            :label="$t('meetings.project.project')"
            readonly
            clearable
            required
            @click:clear="meetingProject = null"
            @click="$emit('show-select-project')"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="py-0">
          <v-text-field
            v-model="meetingDescription"
            :label="$t('Description')"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <!-- Selected Date -->
          <v-chip class="mr-2" @click="$emit('show-select-date')">
            <v-icon class="mr-2">
              mdi-calendar-today
            </v-icon>
            <span v-if="date">
              {{ $t("meetings.date.start", {date: formatDate(date)}) }}
            </span>
            <span v-else>
              {{ $t("meetings.date.select") }}
            </span>
          </v-chip>
          <!-- Selected hours -->
          <v-chip @click="$emit('show-select-hour-range')">
            <v-icon class="mr-2">
              mdi-clock
            </v-icon>
            <span>
              {{ selectedHoursTitle }}
            </span>
          </v-chip>
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
    },
    project: {
      type: Object,
      default: null
    },
    canSelectProject: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    selectedHoursTitle() {
      if (this.selectedStartHour || this.selectedEndHour) {
        return this.$t("meetings.hoursRange.range", {
          start: this.selectedStartHour,
          end: this.selectedEndHour
        });
      }
      return this.$t("meetings.hoursRange.select");
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
    meetingProject: {
      get() {
        return this.project;
      },
      set(newProject) {
        return this.$emit("update:project", newProject);
      }
    },
    projectName() {
      return this.project?.name ? this.project.name : "";
    }
  }
};
</script>
<style lang="scss">
  .meeting-infos {
    .container.meeting-infos__container {
      padding: 0;
    }
    .date-title {
      font-size: 1.3rem;
    }
  }
</style>
