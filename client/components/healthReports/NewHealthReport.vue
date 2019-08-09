<template>
  <div class="new-health-report">
    <select-date @select="onSelectDate" :active.sync="showSelectDate" :disableTime="true"></select-date>

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
          <v-form v-model="valid" v-on:submit.prevent>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field v-model="name" :rules="nameRules" :label="$t('Name')" required></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-list two-line class="elevation-1 date">
                    <v-list-tile @click="showSelectDate = true">
                      <v-list-tile-avatar>
                        <v-icon>calendar_today</v-icon>
                      </v-list-tile-avatar>
                      <v-list-tile-content>
                        <v-list-tile-title>{{ $t('Date') }}</v-list-tile-title>
                        <v-list-tile-sub-title>
                          <span v-show="date">{{ formatDate(date) }}</span>
                        </v-list-tile-sub-title>
                      </v-list-tile-content>
                      <v-list-tile-action>
                        <v-btn flat icon @click.stop="onSelectDate(null)">
                          <v-icon>delete</v-icon>
                        </v-btn>
                      </v-list-tile-action>
                    </v-list-tile>
                </v-list>
              </v-flex>
              <v-flex xs12>
                <v-combobox
                  v-model="weather"
                  :items="items"
                  :label="$t('Project health')"
                >
                  <template slot="selection" slot-scope="data">
                      <img :src="getIcon(data.item)">
                  </template>
                  <template slot="item" slot-scope="data">
                    <img :src="getIcon(data.item)">
                  </template>

                </v-combobox>
              </v-flex>              

              <v-flex xs12>
                <label>{{ $t('Description') }}</label>
                <rich-editor v-model="description" ref="description"></rich-editor>
              </v-flex>

            </v-layout>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="showDialog = false">{{ $t('Cancel') }}</v-btn>
          <v-btn color="primary" @click="create" :disabled="!valid || !coherent">{{ $t('Create') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { HealthReports } from "/imports/api/healthReports/healthReports.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import moment from "moment";

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
        "Date": "Date",
        "None": "None",
        "Weekly point": "Weekly point",
        "Project health": "Project health",
      },
      fr: {
        "New report": "Nouveau bulletin",
        "Date": "Date",
        "None": "Aucune",
        "Weekly point": "Point hebdomadaire",
        "Project health": "Santé du projet",
      }
    }  
  },    
  data() {
    return {
      showDialog: false,
      showSelectDate: false,
      date: null,
      coherent: false,
      valid: false,
      name: "",
      weather: "sunny",
      nameRules: [
        v => !!v || this.$t('Name is mandatory'),
        v => v.length > 1 || this.$t('Name is too short')
      ],
      description: "",
      items: ['sunny', 'cloudy', 'storm']
    };
  },
  methods: {
    open() {
      this.showDialog = true;
      this.name = this.$t("Weekly point");
      this.date = moment().format("YYYY-MM-DD");
      this.description = "";
      this.checkConsistency();

      this.$nextTick(() => this.$refs.description.focus());
    },
    close () {
      this.showDialog = false;
    },
    onSelectDate (date) {
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
        "healthReports.create",
        this.projectId,
        this.name,
        this.description,
        this.date,
        this.weather,
        (error, result) => {
          this.$emit("created");
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
        }
      );
      this.showDialog = false;
    },
    getIcon(weather) {
      return Meteor.absoluteUrl(`/weather/${weather}.svg`);
    }
  }
};
</script>

<style scoped>
.date {
  margin-bottom: 24px;
}
</style>