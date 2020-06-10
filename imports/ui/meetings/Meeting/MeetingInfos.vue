<template>
  <v-container>
    <v-row>
      <v-col>
        <v-text-field
          v-model="meetingName"
          :rules="rules.name"
          :label="$t('Name')"
          required
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-list two-line class="elevation-1 date">
          <v-list-item @click="$emit('show-select-date')">
            <v-list-item-avatar>
              <v-icon>
                mdi-calendar-today
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ $t("Date") }}</v-list-item-title>
              <v-list-item-subtitle>
                <span v-show="date">
                  {{ formatDateTime(date) }}
                </span>
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn text icon @click.stop="$emit('reset-date')">
                <v-icon>
                  mdi-delete
                </v-icon>
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
          v-model="meetingDescription"
          :max-height="!$vuetify.breakpoint.xsOnly ? '200px' : null"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [DatesMixin],
  props: {
    rules: {
      type: Object,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    date: {
      type: String,
      default: null
    }
  },
  computed: {
    meetingName: {
      get() {
        return this.name;
      },
      set(newName) {
        this.$emit("update:name", newName);
      }
    },
    meetingDescription: {
      get() {
        return this.description;
      },
      set(newDescription) {
        this.$emit("update:description", newDescription);
      }
    }
  }
}
</script>