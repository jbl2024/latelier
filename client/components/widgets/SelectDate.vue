<template>
  <div class="select-date">
    <v-dialog :value="active" @input="$emit('update:active')" max-width="320" persistent :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-card-title class="headline">Choisir une date</v-card-title>
        <v-card-text>
          <v-tabs grow>
            <v-tab>
              Date
            </v-tab>
            <v-tab>
              Heure
            </v-tab>
            <v-tab-item>
              <v-date-picker v-model="date" locale="fr-fr" @dblclick.native="checkDblClick"></v-date-picker>
            </v-tab-item>
            <v-tab-item>
              <v-time-picker v-model="hour" format="24hr"></v-time-picker>
            </v-tab-item>
          </v-tabs>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="closeDialog">Annuler</v-btn>
          <v-btn color="info" @click="selectDate" :disabled="!date">Sélectionner</v-btn>
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
    disableTime: Boolean
  },
  data() {
    return {
      date: null,
      hour: null
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
      this.$emit("select", dateTime);
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