<template>
  <div>
    <generic-dialog
      v-model="showDialog"
      :css-classes="['meeting']"
      max-width="1000px"
    >
      <template v-slot:title>
        <div v-if="meeting" class="meeting__header">
          <div class="meeting__title">
            {{ title }}
          </div>
          <div class="meeting__chips">
            <v-chip>
              <v-icon class="mr-2">
                mdi-clock
              </v-icon>
              {{ meetingInterval }}
            </v-chip>
            <v-chip
              v-if="meeting.type && meeting.type !== 'none'"
              color="accent"
            >
              {{ $t(`meetings.types.${meeting.type}`) }}
            </v-chip>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <div v-if="meeting">
          <v-card-text v-if="meeting.description" v-html="markDown(meeting.description)" />
          <v-card-text v-if="meeting.agenda" v-html="markDown(meeting.agenda)" />
        </div>
      </template>
      <template v-slot:actions>
        <template v-if="meeting">
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
      </template>
    </generic-dialog>
  </div>
</template>
<script>
import MarkdownMixin from "/imports/ui/mixins/MarkdownMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin";

export default {
  mixins: [MarkdownMixin, DatesMixin],
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
    };
  },
  computed: {
    title() {
      return this.meeting?.name;
    },
    meetingInterval() {
      return this.displayDateInterval({
        start: this.meeting.startDate,
        end: this.meeting.endDate,
        type: "dateWithHours"
      });
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
      this.close();
      this.$emit("edit-meeting", this.meeting);
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
};
</script>
<style lang="scss">
.meeting {
  .meeting__header {
    display: flex;
    flex-direction: column;
  }
  .meeting__title {
    margin-bottom: 4px;
  }
}
</style>
