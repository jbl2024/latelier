<template>
  <div class="select-date">
    <v-dialog
      :value="active"
      max-width="520"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      @input="$emit('update:active')"
    >
      <v-card class="flex-container">
        <v-toolbar
          v-if="$vuetify.breakpoint.xsOnly"
          dark
          color="primary"
          class="flex0"
        >
          <v-btn icon text @click="closeDialog()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>
            <span>{{ $t("Select date") }}</span>
          </v-toolbar-title>
          <v-spacer />
          <v-toolbar-items>
            <v-btn dark text :disabled="!date" @click="selectDate">
              {{ $t("Select") }}
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-title class="headline">
          {{ $t("Select date") }}
        </v-card-title>
        <v-divider />
        <v-card-text class="flex1">
          <v-tabs v-if="active" grow>
            <v-tabs-slider color="accent" />
            <v-tab>
              Date
            </v-tab>
            <v-tab>
              Heure
            </v-tab>
            <v-tab-item class="pt-2 text-center">
              <v-date-picker
                v-model="date"
                :landscape="!$vuetify.breakpoint.xsOnly"
                locale="fr-fr"
                @dblclick.native="checkDblClick"
              />
            </v-tab-item>
            <v-tab-item class="pt-2 text-center">
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
        <v-card-actions v-if="!$vuetify.breakpoint.xsOnly">
          <v-spacer />
          <v-btn
            v-shortkey="['esc']"
            text
            @click="closeDialog"
            @shortkey="closeDialog()"
          >
            {{ this.$t("Cancel") }}
          </v-btn>
          <v-btn color="primary" :disabled="!date" @click="selectDate">
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

.flex-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.flex0 {
  flex: 0;
  height: 100%;
}

.flex1 {
  flex: 1; /* takes the remaining height of the "container" div */
  overflow: auto; /* to scroll just the "main" div */
}
</style>
