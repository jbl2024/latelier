<template>
  <div class="meeting-attendees-selector">
    <v-combobox
      v-model="attendees"
      :items="items"
      small-chips
      outlined
      multiple
      :search-input.sync="searchInput"
      :label="label"
      hide-details="auto"
      item-value="attendeeId"
      :item-text="getAttendeeName"
      return-object
    >
      <template v-slot:selection="{ attrs, item, parent, selected }">
        <v-chip
          v-if="item === Object(item)"
          v-bind="attrs"
          color="success"
          :input-value="selected"
          small
        >
          <v-avatar v-if="item.role === 'organizer'" left>
            <v-icon>
              mdi-chef-hat
            </v-icon>
          </v-avatar>
          <span class="pr-2">
            {{ getAttendeeName(item) }}
          </span>
          <v-icon
            small
            @click="parent.selectItem(item)"
          >
            mdi-close
          </v-icon>
        </v-chip>
      </template>
      <template v-slot:no-data>
        <v-list-item>
          <span class="mr-2">
            Appuyer sur Entrée pour ajouter
          </span>
          <v-chip class="new-attendee" small>
            {{ `"${searchInput}"` }}
          </v-chip>
          <span class="ml-2">
            aux participants
          </span>
        </v-list-item>
      </template>
      <!--
      <template v-slot:item="data">
        <v-list-item-avatar>
          <meeting-attendee-avatar
            :letters="createAttendeeLetters(data.item)"
            :avatar="data.item.avatar"
          />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ getAttendeeName(data.item) }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ `${isExternalAttendee(data.item) ?
              $t("meetings.attendees.isExternalAttendee") :
              $t("meetings.attendees.isProjectAttendee")}`
            }}
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action @click.stop>
          <meeting-attendee-role-selector
            v-model="data.item.role"
            :roles="roles"
          />
        </v-list-item-action>
      </template>
      -->
    </v-combobox>
  </div>
</template>
<script>
import MeetingUtils from "/imports/api/meetings/utils";
import { mapState } from "vuex";

export default {
  props: {
    items: {
      type: Array,
      default() {
        return [];
      }
    },
    value: {
      type: Array,
      default() {
        return [];
      }
    },
    label: {
      type: String,
      default: null
    },
    search: {
      type: String,
      default: null
    },
    hideSelected: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      editing: null,
      index: -1
    };
  },
  computed: {
    ...mapState("meeting", {
      roles(state) {
        return Object.values(state.meetingRoles).map((role) => ({
          value: role,
          text: this.$t(`meetings.roles.${role}`)
        }));
      }
    }),
    attendees: {
      get() {
        return this.value;
      },
      set(newAttendees) {
        this.$emit("input",
          newAttendees
            .filter((a) => a)
            .map((attendee) => typeof attendee === "string" ? MeetingUtils.createNewAttendee(attendee) : attendee));
      }
    },
    searchInput: {
      get() {
        return this.search;
      },
      set(newSearch) {
        this.$emit("update:search", newSearch);
      }
    }
  },
  methods: {
    isExternalAttendee(attendee) {
      return attendee.userId == null;
    },
    getAttendeeName(attendee) {
      return MeetingUtils.getAttendeeName(attendee);
    },
    createAttendeeLetters(attendee) {
      return MeetingUtils.createAttendeeLetters(attendee);
    }
  }
};
</script>
<style lang="scss">
.meeting-attendees-selector {
  .new-attendee {
    margin: 0 8px;
  }
}
</style>
