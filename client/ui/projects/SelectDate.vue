<template>
  <div class="select-date">

    <md-dialog :md-active.sync="active">
      <md-dialog-title>Choisir une date</md-dialog-title>

      <div class="content">
        <flat-pickr v-model="fakeDate" :config="config" class="invisible" @on-change="onChangeEvent"></flat-pickr>
      </div>
      <md-dialog-actions>
        <md-button class="md-button" @click="closeDialog">Annuler</md-button>
        <md-button class="md-button md-primary" @click="selectDate">Confirmer</md-button>
      </md-dialog-actions>
    </md-dialog>  
  </div>    
</template>

<script>
import { Meteor } from 'meteor/meteor'
import { Projects } from '/imports/api/projects/projects.js'
import flatPickr from 'vue-flatpickr-component';
import confirmDatePlugin from 'flatpickr/dist/plugins/confirmDate/confirmDate.js';
import 'flatpickr/dist/flatpickr.css';
import {French} from 'flatpickr/dist/l10n/fr';

export default {
  props: {
    active: Boolean,
    disableTime: Boolean
  },
  data () {
    return {
      fakeDate: null,
      date: null,
      config: {
        enableTime: !this.disableTime,
        altInput: true,
        altFormat: 'd/m/Y H:i',
        weekNumbers: true,
        inline: true,
        time_24hr: true,
        locale: French,
      },             
    }
  },
  components: {
    flatPickr
  },
  methods: {
    closeDialog () {
      this.$emit('update:active', false);
    },

    onChangeEvent (dates) {
      if (dates && dates.length > 0) {
        this.date = dates[0];
      } else {
        this.date = null;
      }
    },

    selectDate () {
      this.$emit('update:active', false);
      this.$emit('select', this.date);
    }
  }
}
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