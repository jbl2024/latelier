<template>
  <generic-dialog
    v-model="showDialog"
    max-width="600px"
  >
    <template #title>
      <slot name="title" />
    </template>
    <template v-slot:content>
      <!-- Attendees -->
      <meeting-attendees
        v-model="selectedAttendees"
        class="meeting-edit__attendees"
        :attendees="attendees"
        display="list"
        :project-id="projectId"
        search-attendees-only
        :multiple="multiple"
      />
    </template>
    <template v-slot:actions>
      <v-btn dark color="success" @click="selectAttendees">
        {{ $t("Select") }}
      </v-btn>
    </template>
  </generic-dialog>
</template>
<script>
import MeetingAttendees from "./MeetingAttendees";

export default {
  components: {
    MeetingAttendees
  },
  props: {
    projectId: {
      type: String,
      default: null
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
    isShown: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedAttendees: []
    };
  },
  computed: {
    showDialog: {
      get() {
        return this.isShown;
      },
      set(isShown) {
        this.$emit("update:is-shown", isShown);
      }
    }
  },
  methods: {
    open() {
      this.showDialog = true;
    },
    close() {
      this.showDialog = false;
    },
    selectAttendees() {
      this.$emit("select-attendees", this.selectedAttendees);
    }
  }
};
</script>
