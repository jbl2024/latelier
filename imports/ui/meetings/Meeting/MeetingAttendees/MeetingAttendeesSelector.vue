<template>
  <div class="meeting-attendees-selector">
    <v-combobox
      v-model="attendees"
      :items="items"
      chips
      :search-input.sync="searchInput"
      :label="label"
      :item-text="showUserFullname"
      return-object
      multiple
    >
      <template v-slot:selection="{ attrs, item, parent, selected }">
        <v-chip
          v-if="item === Object(item)"
          v-bind="attrs"
          color="success"
          :input-value="selected"
          small
        >
          <span class="pr-2">
            {{ showUserFullname(item) }}
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
          <v-list-item @click="addCreatedAttendee(searchInput)">
            <span class="mr-2">Ajouter</span>
            <v-chip class="new-attendee" small>
              {{ `"${searchInput}"` }}
            </v-chip>
            <span class="ml-2">
              aux participants
            </span>
          </v-list-item>
      </template>
      <template v-slot:item="data">
        <template>
          <v-list-item-avatar>
            <author-avatar
              :title="getUserTitle(data.item)"
              :user-letters="getUserLetters(data.item)"
              :user-id="data.item"
            />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
                {{ showUserFullname(data.item) }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ `${isCreatedAttendee(data.item) ? 
                $t("meetings.attendees.isCreatedAttendee") : $t("meetings.attendees.isProjectAttendee")}`
              }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </template>
      </template>
    </v-combobox>
  </div>
</template>
<script>
export default {
  props: {
    items: {
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
    }
  },
  data() {
    return {
      value: []
    }
  },
  computed: {
    attendees: {
      get() {
        return this.value;
      },
      set(newAttendees) {
        this.$emit("input", newAttendees);
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
    isCreatedAttendee(user) {
      return user?.isNew === true;
    },
    getUserTitle(user) {
      return this.isCreatedAttendee(user) ? this.showUserFullname(user) : null;
    },
    getUserLetters(user) {
      return this.isCreatedAttendee(user) ? this.createUserLetters(user) : null;
    },
    createUserLetters(user) {
      hasFirstName = user?.profile?.firstName != null && user?.profile?.firstName != "";
      hasLastName = user?.profile?.lastName != null && user?.profile?.lastName != "";
      return `${hasFirstName ? user.profile.firstName[0] : ""}
      ${hasFirstName && hasLastName && user.profile.lastName[0] ? user.profile.lastName[0] : ""}`;
    },
    showUserFullname(user) {
      if (!user?.profile) return "";
      return `${user.profile.firstName} ${user.profile.lastName}`;
    },
    addCreatedAttendee(attendeeName) {
      this.$emit("add-created-attendee", attendeeName);
    }
  }
}
</script>
<style lang="scss">
.meeting-attendees-selector {
  .new-attendee {
    margin: 0 8px;
  }
}
</style>