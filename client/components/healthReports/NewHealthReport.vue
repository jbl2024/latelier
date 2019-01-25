<template>
  <div class="new-health-report">
    <select-date @select="onSelectStartDate" :active.sync="showSelectStartDate" :disableTime="true"></select-date>
    <select-date @select="onSelectEndDate" :active.sync="showSelectEndDate" :disableTime="true"></select-date>


    <v-dialog v-model="showDialog" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon flat @click="close()" v-shortkey="['esc']" @shortkey="close()">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>
            <span>{{ $t('New report') }} </span>
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-form v-on:submit.prevent>
            <v-layout wrap>
              <v-flex xs12>
                <v-list two-line class="elevation-1">
                    <v-list-tile @click="showSelectStartDate = true">
                      <v-list-tile-avatar>
                        <v-icon>calendar_today</v-icon>
                      </v-list-tile-avatar>
                      <v-list-tile-content>
                        <v-list-tile-title>{{ $t('Start date') }}</v-list-tile-title>
                        <v-list-tile-sub-title>
                          <span v-show="startDate">{{ formatDate(startDate) }}</span>
                          <span v-show="!startDate">{{ $t('None') }}</span>
                        </v-list-tile-sub-title>
                      </v-list-tile-content>
                      <v-list-tile-action>
                        <v-btn flat icon @click.stop="onSelectStartDate(null)">
                          <v-icon>delete</v-icon>
                        </v-btn>
                      </v-list-tile-action>
                    </v-list-tile>

                    <v-divider></v-divider>

                    <v-list-tile @click="showSelectEndDate = true">
                      <v-list-tile-avatar>
                        <v-icon>alarm_on</v-icon>
                      </v-list-tile-avatar>
                      <v-list-tile-content>
                        <v-list-tile-title>{{ $t('End date') }}</v-list-tile-title>
                        <v-list-tile-sub-title>
                          <span v-show="endDate">{{ formatDate(endDate) }}</span>
                          <span v-show="!endDate">{{ $t('None') }}</span>
                        </v-list-tile-sub-title>
                      </v-list-tile-content>
                      <v-list-tile-action>
                        <v-btn flat icon @click.stop="onSelectEndDate(null)">
                          <v-icon>delete</v-icon>
                        </v-btn>
                      </v-list-tile-action>
                    </v-list-tile>

                </v-list>
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="showDialog = false">{{ $t('Cancel') }}</v-btn>
          <v-btn color="primary" @click="create" :disabled="!coherent">{{ $t('Create') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { HealthReports } from "/imports/api/healthReports/healthReports.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [DatesMixin],
  props: {
    projectId: {
      type: String,
      defaultValue: "0"
    }
  },
  i18n: {
    messages: {
      en: { 
        "New report": "New report",
        "Start date": "Start date",
        "End date": "End date",
        "None": "None",
      },
      fr: {
        "New report": "Nouveau bulletin",
        "Start date": "Date de début",
        "End date": "Date de fin",
        "None": "Aucune",
      }
    }  
  },    
  data() {
    return {
      showDialog: false,
      showSelectStartDate: false,
      showSelectEndDate: false,
      startDate: null,
      endDate: null,
      coherent: false,
      dateRules: [
        v => !!v || "La date est obligatoire"
      ]

    };
  },
  methods: {
    open() {
      this.showDialog = true;
    },
    close () {
      this.showDialog = false;
    },
    onSelectStartDate (date) {
      this.startDate = date;
      this.checkConsistency();
    },
    onSelectEndDate (date) {
      this.endDate = date;
      this.checkConsistency();
    },  
    checkConsistency() {
      if (!this.startDate || !this.endDate) {
        this.coherent = false;
        return;
      }
      if (this.startDate && this.endDate) {
        if (this.startDate > this.endDate) {
          this.coherent = false;
          return;
        }
        this.coherent = true;
      }
    },
    create() {
      this.showDialog = false;
      Meteor.call(
        "healthReports.create",
        this.projectId,
        this.startDate,
        this.endDate,
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
        }
      );
      this.showDialog = false;
    }
  }
};
</script>

<style scoped>
</style>