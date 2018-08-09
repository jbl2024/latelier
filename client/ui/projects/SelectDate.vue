<template>
  <div class="select-date">

    <md-dialog :md-active.sync="active">
      <md-dialog-title>Choisir une date</md-dialog-title>

      <div class="content">
        <flat-pickr v-model="date" :config="config" class="invisible"></flat-pickr>
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
  },
  data () {
    return {
      date: null,
      config: {
        enableTime: true,
        altInput: true,
        weekNumbers: true,
        inline: true,
        time_24hr: true,
        altFormat: 'd/m/Y H:i',
        locale: French,
        "enableTime": true
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