<template>
  <div>
    <generic-dialog
      v-model="showDialog"
      :title="title"
      :css-classes="['new-meeting']"
      max-width="1000px"
    >
      <template v-slot:content>
        <div v-if="meeting">
          <v-card-text v-if="meeting.description" v-html="meeting.description">
          </v-card-text>
        </div>
      </template>
      <template v-slot:actions>
        <v-btn @click="editMeeting">
          <v-icon>
            mdi-pencil
          </v-icon>
          {{ $t("meetings.edit") }}
        </v-btn>
        <v-btn color="black" dark :disabled="!valid" @click="openMeeting">
          {{ $t("meetings.participate") }}
        </v-btn>
      </template>
    </generic-dialog>
  </div>
</template>
<script>
export default {
  props: {
    meeting: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showDialog: false,
      valid: true
    }
  },
  computed: {
    title() {
      return this.meeting?.name;
    }
  },
  methods: {
    open() {
      this.showDialog = true;
    },
    close() {
      this.showDialog = false;
    },
    editMeeting() {
      /*
      this.close();
      this.$emit("edit-meeting", this.meeting); */
    },
    async openMeeting() {
      await this.$router.push({
        name: "meetings",
        params: { 
          meetingId: this.meeting._id,
          projectId: this.meeting.projectId
        }
      });
    }
  }
}
</script>