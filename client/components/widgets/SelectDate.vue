<template>
  <div class="select-date">
    <v-dialog :value="active" @input="$emit('update:active')" max-width="520" persistent :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-card-title class="headline">{{ $t('Select date') }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-tabs grow v-if="active">
            <v-tab>
              Date
            </v-tab>
            <v-tab>
              Heure
            </v-tab>
            <v-tab-item>
              <v-date-picker :landscape="!$vuetify.breakpoint.xsOnly" v-model="date" locale="fr-fr" @dblclick.native="checkDblClick"></v-date-picker>
            </v-tab-item>
            <v-tab-item>
              <v-time-picker :landscape="!$vuetify.breakpoint.xsOnly" v-model="hour" format="24hr"></v-time-picker>
            </v-tab-item>
          </v-tabs>
          <v-select v-if="reminder"
            v-model="selectedReminder"
            dense
            :items="reminders"
            :label="$t('Reminder')"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="closeDialog">{{ this.$t('Cancel') }}</v-btn>
          <v-btn color="info" @click="selectDate" :disabled="!date">{{ $t('Select') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Projects } from "/imports/api/projects/projects.js";

export default {
  props: {
    active: Boolean,
    disableTime: Boolean,
    reminder: Boolean
  },
  data() {
    return {
      date: null,
      hour: null,
      selectedReminder: null,
      reminders: [
        {text: this.$t('Never'), value: 'never'},
        {text: this.$t('On due date'), value: "0"},
        {text: this.$t('15 minutes before'), value: "15"},
        {text: this.$t('1 hour before'), value: "60"},
        {text: this.$t('2 hours before'), value: "120"},
        {text: this.$t('1 day before'), value: "1140"},
        {text: this.$t('2 days before'), value: "2280"},
      ]
    };
  },
  methods: {
    closeDialog() {
      this.$emit("update:active", false);
    },

    selectDate() {
      let dateTime = this.date;
      if (this.hour) {
        dateTime = dateTime + ' ' + this.hour;
      }
      this.$emit("update:active", false);
      this.$emit("select", dateTime, this.selectedReminder);
    },

    checkDblClick(event) {
      const target = event.target;
      if (target.classList.contains('v-btn__content')) {
        this.selectDate();
      }
    }
  }
};
</script>

<style>
.invisible {
  display: none;
}

.flatpickr-confirm {
  cursor: pointer;
  padding: 24px;
  border-top: 1px solid #aaa;
}
</style>