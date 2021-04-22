<template>
  <div class="meeting-external-attendees">
    <div class="meeting-external-attendees__add">
      <v-text-field
        v-model="input"
        class="meeting-external-attendees__input"
        :label="$t('meetings.attendees.addExternalAttendee')"
        single-line
        clearable
        autofocus
        hide-details="auto"
        @keyup.enter="addAttendee"
      />
      <v-btn
        color="success"
        @click="addAttendee"
      >
        <v-icon left>
          mdi-plus
        </v-icon>
        {{ $t("Add") }}
      </v-btn>
    </div>
    <template v-if="attendees.length > 0">
      <div class="meeting-external-attendees__list">
        <v-list subheader>
          <v-list-item-group
            :value="selectedIds"
            :multiple="true"
            active-class="success--text"
          >
            <template v-for="attendee in attendees">
              <v-list-item
                :key="attendee.attendeeId"
                :value="attendee.attendeeId"
                @click="toggleSelect(attendee)"
              >
                <v-list-item-avatar
                  v-if="isSelected(attendee)"
                  color="success"
                >
                  <v-icon color="white">
                    mdi-check
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-avatar
                  v-else
                >
                  <meeting-attendee-avatar
                    :letters="createAttendeeLetters(attendee)"
                  />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ getAttendeeName(attendee) }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ $t("meetings.attendees.isExternalAttendee") }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action @click.stop="removeAttendee(attendee)">
                  <v-btn icon text>
                    <v-icon color="error">
                      mdi-close
                    </v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </template>
          </v-list-item-group>
        </v-list>
      </div>
      <div class="flex0">
        <div class="text-xs-center">
          <v-pagination
            v-if="pagination.totalPages > 1"
            v-model="page"
            :length="pagination.totalPages"
          />
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import MeetingUtils from "/imports/api/meetings/utils";
import MeetingAttendeeAvatar from "/imports/ui/meetings/Meeting/MeetingAttendees/MeetingAttendeeAvatar";

export default {
  components: {
    MeetingAttendeeAvatar
  },
  props: {
    value: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      input: "",
      attendees: [],
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      }
    };
  },
  computed: {
    selectedAttendees: {
      get() {
        return this.value;
      },
      set(newSelectedAttendees) {
        this.$emit("input", newSelectedAttendees);
      }
    },
    selectedIds() {
      return this.value.map((a) => a.attendeeId);
    }
  },
  methods: {
    addAttendee() {
      if (!this.input) return;
      const newAttendee = MeetingUtils.createNewAttendee(this.input);
      this.attendees.push(newAttendee);
      this.selectedAttendees.push(newAttendee);
      this.input = "";
    },
    removeAttendee(attendee) {
      const index = this.getAttendeeIndex(attendee);
      const selectedIndex = this.getSelectedAttendeeIndex(attendee);
      if (index !== -1) {
        this.attendees.splice(index, 1);
      }
      if (selectedIndex !== -1) {
        this.selectedAttendees(selectedIndex, 1);
      }
    },
    getAttendeeIndex(attendee) {
      return this.attendees.findIndex((a) => a.attendeeId === attendee.attendeeId);
    },
    getSelectedAttendeeIndex(attendee) {
      return this.selectedAttendees.findIndex((a) => a.attendeeId === attendee.attendeeId);
    },
    isSelected(attendee) {
      return this.getSelectedAttendeeIndex(attendee) !== -1;
    },
    getAttendeeName(attendee) {
      return MeetingUtils.getAttendeeName(attendee);
    },
    isExternalAttendee(attendee) {
      return MeetingUtils.isExternalAttendee(attendee);
    },
    createAttendeeLetters(attendee) {
      return MeetingUtils.createAttendeeLetters(attendee);
    },
    toggleSelect(attendee) {
      const index = this.getSelectedAttendeeIndex(attendee);
      if (index !== -1) {
        this.selectedAttendees.splice(index, 1);
      } else {
        this.selectedAttendees.push(attendee);
      }
    }
  }
};
</script>
<style lang="scss">
.meeting-external-attendees {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 300px;
  padding-top: 16px;
  .meeting-external-attendees__add {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }
  .meeting-external-attendees__input {
    padding: 0;
    margin-top: 0;
    margin-right: 6px;
  }

  .meeting-external-attendees__list {
    flex: 1;
    overflow-y: scroll;
  }
}

</style>
