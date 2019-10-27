<template>
  <div class="select-date">
    <v-dialog
      :value="active"
      max-width="520"
      persistent
      :fullscreen="$vuetify.breakpoint.xsOnly"
      @input="$emit('update:active')"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t("Select date") }}
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-tabs v-if="active" grow>
            <v-tab>
              Date
            </v-tab>
            <v-tab>
              Heure
            </v-tab>
            <v-tab-item>
              <v-date-picker
                v-model="date"
                :landscape="!$vuetify.breakpoint.xsOnly"
                locale="fr-fr"
                @dblclick.native="checkDblClick"
              />
            </v-tab-item>
            <v-tab-item>
              <v-time-picker
                v-model="hour"
                :landscape="!$vuetify.breakpoint.xsOnly"
                format="24hr"
              />
            </v-tab-item>
          </v-tabs>
          <v-select
            v-if="reminder"
            v-model="selectedReminder"
            class="reminder"
            dense
            :items="reminders"
            :label="$t('Reminder')"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">
            {{ this.$t("Cancel") }}
          </v-btn>
          <v-btn color="info" :disabled="!date" @click="selectDate">
            {{ $t("Select") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
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
        { text: this.$t("reminders.never"), value: "never" },
        { text: this.$t("reminders.onDueDate"), value: "0" },
        { text: this.$t("reminders.15minutes"), value: "15" },
        { text: this.$t("reminders.1hour"), value: "60" },
        { text: this.$t("reminders.2hours"), value: "120" },
        { text: this.$t("reminders.1day"), value: "1140" },
        { text: this.$t("reminders.2days"), value: "2280" },
        { text: this.$t("reminders.1week"), value: "7980" }
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
        dateTime = `${dateTime} ${this.hour}`;
      }
      this.$emit("update:active", false);
      this.$emit("select", dateTime, this.selectedReminder);
    },

    checkDblClick(event) {
      const { target } = event;
      if (target.classList.contains("v-btn__content")) {
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

.reminder {
  margin-top: 24px;
}

.textpickr-confirm {
  cursor: pointer;
  padding: 24px;
  border-top: 1px solid #aaa;
}
</style>
