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
        <v-form v-model="valid" @submit.prevent>
          <v-tabs vertical>
            <v-tab class="new-meeting__tab" v-for="section in sections" :key="section.id">
              <v-icon left>
                {{ section.icon }}
              </v-icon>
              <span> {{ section.text }} </span>
            </v-tab>
            <!-- Meeting Infos and selected date -->
            <v-tab-item :transition="false" :reverse-transition="false">
              <meeting-infos
                :rules="rules"
                :name="name"
                :description.sync="description"
                :date="date"
                @show-select-date="showSelectDate = true"
                @reset-date="date = null"
              />
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

export default {
  components: {
    MeetingInfos
  },
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      sections: Object.freeze([
        {id: "infos", text: "Infos", icon: "mdi-information-outline"},
        // {id: "members", text: "Membres", icon: "mdi-account"}
      ]),
      showDialog: false,
      showSelectDate: false,
      coherent: false,
      valid: false,
      name: "",
      description: "",
      date: null,
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
        this.date = moment().format("YYYY-MM-DD");
        this.description = "";
        this.checkConsistency();
        this.name = this.$t("New meeting");
      })
    },
    close() {
      this.showDialog = false;
    },
    onSelectDate(date) {
      this.date = date;
      this.checkConsistency();
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
      Meteor.call(
        "meetings.create",
        {
          projectId: this.projectId,
          schedule: this.date,
          name: this.name,
          description: this.description
        },
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
