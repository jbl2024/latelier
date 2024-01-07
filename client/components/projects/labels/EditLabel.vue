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
            {{ $t('Choose color') }}
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

    async updateNameAndColor() {
      try {
        await Meteor.callAsync("labels.updateNameAndColor", {
          labelId: this.label._id,
          name: this.label.name,
          color: this.label.color
        });
        this.showDialog = false;
      } catch (error) {
        this.$notifyError(error);
      }
    },

    async remove() {
      this.showDialog = true;
      try {
        const res = await this.$confirm("Voulez-vous supprimer définitivement ce label ?");
        if (res) {
          await Meteor.callAsync("labels.remove", { labelId: this.label._id });
        }
      } catch (error) {
        this.$notifyError(error);
      } finally {
        this.showDialog = false;
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
