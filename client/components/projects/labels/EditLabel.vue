<template>
  <div class="edit-label">
    <v-dialog
      v-model="showDialog"
      max-width="420"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <select-color :active.sync="showSelectColor" @select="onSelectColor" />
      <v-card>
        <v-card-title class="headline">
          Editer le label
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid" @submit.prevent>
            <v-text-field
              ref="name"
              v-model="label.name"
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
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showDialog = false">
            {{ this.$t("Cancel") }}
          </v-btn>
          <v-btn color="error" @click="remove">
            {{ this.$t("Delete") }}
          </v-btn>
          <v-btn color="primary" :disabled="!valid" @click="updateNameAndColor">
            Modifier
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Labels } from "/imports/api/labels/labels.js";
import { autofocus } from "/imports/ui/autofocus";

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
      this.$nextTick(() => autofocus.focus(this.$refs.name));
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
            this.$store.dispatch("notifyError", error);
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
        Meteor.call(
          "labels.remove",
          { labelId: this.label._id },
          (error) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
              return;
            }
            this.showDialog = false;
          }
        );
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
