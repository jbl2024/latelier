<template>
  <v-list>
    <v-list-item-group
      v-model="selectedListItems"
      :multiple="multiple"
      active-class="success--text"
    >
      <v-list-item
        v-for="attendee in attendees"
        :key="attendee.attendeeId"
        @click.stop="selectAttendee(attendee)"
      >
        <v-list-item-avatar>
          <meeting-attendee-avatar
            :letters="createAttendeeLetters(attendee)"
            :avatar="attendee.avatar"
          />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ getAttendeeName(attendee) }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ `${isExternalAttendee(attendee) ?
              $t("meetings.attendees.isExternalAttendee") :
              $t("meetings.attendees.isProjectAttendee")}`
            }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list-item-group>
  </v-list>
</template>
<script>
import MeetingAttendeeAvatar from "/imports/ui/meetings/Meeting/MeetingAttendees/MeetingAttendeeAvatar";
import MeetingAttendeeMixin from "/imports/ui/mixins/MeetingAttendeeMixin.js";

export default {
  components: {
    MeetingAttendeeAvatar
  },
  mixins: [MeetingAttendeeMixin],
  props: {
    value: {
      type: Array,
      default() {
        return [];
      }
    },
    attendees: {
      type: Array,
      default() {
        return [];
      }
    },
    multiple: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      selectedListItems: []
    };
  },
  computed: {
    selectedAttendees: {
      get() {
        return this.value;
      },
      set(newAttendees) {
        this.$emit("input", newAttendees);
      }
    }
  },
  methods: {
    getSelectedAttendeeIndex(attendee) {
      return this.selectedAttendees
        .findIndex((selectedAttendee) => selectedAttendee.attendeeId === attendee.attendeeId);
    },
    selectAttendee(attendee) {
      const existingIndex = this.getSelectedAttendeeIndex(attendee);
      if (existingIndex === -1) {
        this.selectedAttendees.push(attendee);
      }
    }
  }
};
</script>
