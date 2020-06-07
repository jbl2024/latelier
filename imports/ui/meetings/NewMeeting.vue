<template>
  <div>
    <generic-dialog
      v-model="showDialog"
      :title="$t('New meeting')"
      max-width="800px"
    >
      <template v-slot:content>
        <select-date
          v-model="showSelectDate"
          :disable-time="true"
          @select="onSelectDate"
        />

        <v-form v-model="valid" @submit.prevent>
          <v-container>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="name"
                  :rules="nameRules"
                  :label="$t('Name')"
                  required
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-list two-line class="elevation-1 date">
                  <v-list-item @click="showSelectDate = true">
                    <v-list-item-avatar>
                      <v-icon>mdi-calendar-today</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>{{ $t("Date") }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <span v-show="date">{{ formatDateTime(date) }}</span>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn text icon @click.stop="onSelectDate(null)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <label>{{ $t("Description") }}</label>
                <rich-editor
                  ref="description"
                  v-model="description"
                  :max-height="!$vuetify.breakpoint.xsOnly ? '200px' : null"
                />
              </v-col>
            </v-row>
          </v-container>
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
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import moment from "moment";

export default {
  mixins: [DatesMixin],
  props: {
    projectId: {
      type: String,
      default: null
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
      nameRules: [
        (v) => !!v || this.$t("Name is mandatory"),
        (v) => v.length > 1 || this.$t("Name is too short")
      ],
      description: ""
    };
  },
  methods: {
    open() {
      this.showDialog = true;
      this.name = this.$t("New meeting");
      this.date = moment().format("YYYY-MM-DD");
      this.description = "";
      this.checkConsistency();
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
          name: this.name,
          description: this.description
        },
        (error) => {
          this.$emit("created");
          if (error) {
            this.$notifyError(error);
          }
        }
      );
      this.showDialog = false;
    }
  }
};
</script>

<style scoped>
.date {
  margin-bottom: 24px;
}
</style>
