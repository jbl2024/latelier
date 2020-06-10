<template>
  <div>
    <generic-dialog
      v-model="showDialog"
      :title="$t('meetings.newMeeting')"
      :css-classes="['new-meeting']"
      max-width="1000px"
    >
      <template v-slot:content>
        <select-date
          v-model="showSelectDate"
          :disable-time="true"
          @select="onSelectDate"
        />
        <select-hour-range
          v-model="showSelectHourRange"
          :allowed-minutes="allowedMinutes"
          :allowed-hours="allowedHours"
          :start.sync="startHour"
          :end.sync="endHour"
        />
        <v-form v-model="valid" @submit.prevent>
          <v-tabs vertical>
            <v-tab class="new-meeting__tab" v-for="section in sections" :key="section.id">
              <v-icon left>
                {{ section.icon }}
              </v-icon>
              <span> {{ section.text }} </span>
            </v-tab>
            <!-- Infos and selected date -->
            <v-tab-item :transition="false" :reverse-transition="false">
              <meeting-infos
                :rules="rules"
                :name="name"
                :description.sync="description"
                :date="date"
                :start-hour.sync="startHour"
                :end-hour.sync="endHour"
                @show-select-date="showSelectDate = true"
                @reset-date="date = null"
                @show-select-hour-range="showSelectHourRange = true"
                @reset-hour-range="resetHourRange"
              />
            </v-tab-item>
            <!-- Agenda -->
            <v-tab-item :transition="false" :reverse-transition="false">

            </v-tab-item>
          </v-tabs>
        </v-form>
      </template>
      <template v-slot:actions>
        <v-btn text :disabled="!valid || !coherent" @click="create">
          {{ $t("Create") }}
        </v-btn>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import MeetingInfos from "./MeetingInfos";
import moment from "moment";
import SelectHourRange from "/imports/ui/widgets/SelectHourRange";

export default {
  components: {
    MeetingInfos,
    SelectHourRange
  },
  props: {
    projectId: {
      type: String,
      default: null
    },
    meeting: {
      type: Object,
      default: null
    },
    selectedDate: {
      type: [Date, String],
      default() {
        return moment().format("YYYY-MM-DD");
      }
    },
    selectedStartHour: {
      type: String,
      default: null
    },
    selectedEndHour: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      sections: Object.freeze([
        {id: "infos", text: "Infos", icon: "mdi-information-outline"},
        {id: "agenda", text: "Agenda", icon: "mdi-format-list-numbered"}
        // {id: "members", text: "Membres", icon: "mdi-account"}
      ]),
      allowedMinutes: Object.freeze([00, 10, 15, 30, 45]),
      allowedHours: Object.freeze([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]),
      showDialog: false,
      showSelectDate: false,
      showSelectHourRange: false,
      coherent: false,
      valid: false,
      name: "",
      description: "",
      date: null,
      startHour: null,
      endHour: null,
      rules: {
        names: [
          (v) => !!v || this.$t("Name is mandatory"),
          (v) => v.length > 1 || this.$t("Name is too short")
        ]
      }
    };
  },
  methods: {
    open() {
      this.showDialog = true;
      this.$nextTick(() => {
        this.date = this.selectedDate;
        this.startHour = this.selectedStartHour;
        this.endHour = this.selectedEndHour;
        this.description = "";
        this.checkConsistency();
        this.name = this.$t("meetings.meeting");
      })
    },
    close() {
      this.showDialog = false;
    },
    onSelectDate(date) {
      this.date = date;
      this.checkConsistency();
    },
    resetHourRange() {
      this.startHour = null;
      this.endHour = null;
    },
    checkConsistency() {
      if (!this.date) {
        this.coherent = false;
        return;
      }
      this.coherent = true;
    },
    create() {
      this.showDialog = false;
      const params = {
        name: this.name,
        projectId: this.projectId,
        startDate: `${this.date} ${this.startHour}:00`,
        endDate: `${this.date} ${this.endHour}:00`,
        description: this.description
      };
      Meteor.call(
        "meetings.create",
        params,
        (error) => {
          if (error) {
            this.$notifyError(error);
          } else {
            this.$emit("created");
            this.$notify("Meeting created");
          }
        }
      );
      this.showDialog = false;
    }
  }
};
</script>

<style lang="scss">
.v-dialog > .new-meeting.v-card > .v-card__text {
  padding: 0;
}
.new-meeting {
  .date {
    margin-bottom: 24px;
  }

  .v-dialog>.v-card>.v-card__text

  &__tab.v-tab {
    justify-content: flex-start;
  }
}
</style>
