<template>
  <v-toolbar class="meetings-dashboard-toolbar" :flat="flat" :dense="dense">
    <div class="left-side">
      <!-- Toggling between calendar and list views -->
      <meeting-calendar-display-type-selector
        v-model="selectedDisplayType"
        :display-types="displayTypes"
      />
      <!-- Add new meeting -->
      <v-btn dark @click="$emit('add-new-meeting')">
        <v-icon left>
          mdi-plus
        </v-icon>
        {{ $t('meetings.meeting') }}
      </v-btn>
    </div>
  </v-toolbar>
</template>
<script>
import MeetingCalendarDisplayTypeSelector from "/imports/ui/meetings/MeetingCalendar/MeetingCalendarDisplayTypeSelector";

export default {
  components: {
    MeetingCalendarDisplayTypeSelector
  },
  props: {
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
    flat: {
      type: Boolean,
      default: false
    },
    dense: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    selectedDisplayType: {
      get() {
        return this.displayType;
      },
      set(newDisplayType) {
        if (!newDisplayType) return false;
        return this.$emit("update:display-type", newDisplayType);
      }
    }
  }
};
</script>
