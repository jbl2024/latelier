<template>
  <div class="edit-label">
    <generic-dialog v-model="showDialog" max-width="420" :title="$t('Edit')">
      <template v-slot:content>
        <select-color :active.sync="showSelectColor" @select="onSelectColor" />
        <v-form v-model="valid" @submit.prevent>
          <v-text-field
            v-model="label.name"
            autofocus
            :rules="nameRules"
            :label="$t('Name')"
            required
            @keyup.enter="updateNameAndColor()"
          />
          <v-btn
            color="primary"
            class="btn-color"
            @click="showSelectColor = true"
          >
            Choisir une couleur
          </v-btn>
          <div
            ref="color"
            class="color"
            :style="getColor(label)"
            @click="showSelectColor = true"
          />
        </v-form>
      </template>
      <template v-slot:actions>
        <v-btn text @click="remove">
          {{ $t("Delete") }}
        </v-btn>
        <v-btn text :disabled="!valid" @click="updateNameAndColor">
          {{ $t("Update") }}
        </v-btn>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Labels } from "/imports/api/labels/labels.js";

export default {
  props: {
    labelId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      valid: false,
      showDialog: false,
      showSelectColor: false,
      label: {},
      name: "",
      nameRules: [
        (v) => !!v || this.$t("Name is mandatory"),
        (v) => (v && v.length >= 1) || this.$t("Name is too short")
      ]
    };
  },
  meteor: {
    label: {
      params() {
        return {
          id: this.labelId
        };
      },
      deep: false,
      update({ id }) {
        return Labels.findOne({ _id: id }) || {};
      }
    }
  },
  methods: {
    open() {
      this.showDialog = true;
    },

    updateNameAndColor() {
      Meteor.call(
        "labels.updateNameAndColor",
        {
          labelId: this.label._id,
          name: this.label.name,
          color: this.label.color
        },
        (error) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.showDialog = false;
        }
      );
    },

    remove() {
      /* eslint no-alert: off */
      /* eslint no-restricted-globals: off */
      if (confirm("Voulez-vous supprimer définitivement ce label ?")) {
        Meteor.call("labels.remove", { labelId: this.label._id }, (error) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.showDialog = false;
        });
      }
    },

    getColor(label) {
      return `background-color: ${label.color}`;
    },

    onSelectColor(color) {
      const hex = color || "white";
      this.$refs.color.style.backgroundColor = hex;
      this.label.color = hex;
    }
  }
};
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
}

.color {
  width: 100%;
  height: 32px;
  margin-bottom: 24px;
  cursor: pointer;
}

.btn-color {
  margin-left: 0;
  margin-bottom: 6px;
  width: 100%;
}
</style>
