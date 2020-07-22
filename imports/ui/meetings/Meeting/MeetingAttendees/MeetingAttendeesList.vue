<template>
  <v-list class="meeting-attendees-list">
    <slot name="list-prepend" />
    <!-- Attendees list -->
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
        <template v-if="edit">
          <v-list-item-action @click.stop>
            <meeting-attendee-role-selector
              v-model="attendee.role"
            />
          </v-list-item-action>
          <v-list-item-action @click.stop="$emit('remove', attendee)">
            <v-btn icon text>
              <v-icon color="error">
                mdi-close
              </v-icon>
            </v-btn>
          </v-list-item-action>
        </template>
      </v-list-item>
    </v-list-item-group>
  </v-list>
</template>
<script>
import MeetingAttendeeRoleSelector from "/imports/ui/meetings/Meeting/MeetingAttendees/MeetingAttendeeRoleSelector";
import MeetingAttendeeAvatar from "/imports/ui/meetings/Meeting/MeetingAttendees/MeetingAttendeeAvatar";
import MeetingUtils from "/imports/api/meetings/utils";

export default {
  components: {
    MeetingAttendeeRoleSelector,
    MeetingAttendeeAvatar
  },
  props: {
    organizationId: {
      type: String,
      default: null
    },
    projectId: {
      type: String,
      default: null
    },
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
    },
    edit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      filter: "",
      selectedListItems: []
    };
  },
  computed: {
    isReady() {
      return this.projectId !== null || this.organizationId !== null;
    },
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
    getAttendeeName(attendee) {
      return MeetingUtils.getAttendeeName(attendee);
    },
    isExternalAttendee(attendee) {
      return MeetingUtils.isExternalAttendee(attendee);
    },
    createAttendeeLetters(attendee) {
      return MeetingUtils.createAttendeeLetters(attendee);
    },
    selectAttendee(attendee) {
      this.$emit("select", attendee);
    }
  }
};
</script>
<style lang="scss" scoped>
  .meeting-attendees-list .v-list {
    padding: 0;
  }
</style>
