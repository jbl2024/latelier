<template>
  <div class="new-label">
    <generic-dialog
      v-model="showDialog"
      max-width="420"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      :title="$t('Label')"
    >
      <template v-slot:content>
        <select-color :active.sync="showSelectColor" @select="onSelectColor" />
        <v-form v-model="valid" class="form" @submit.prevent>
          <v-text-field
            ref="name"
            v-model="name"
            :rules="nameRules"
            :label="$t('Name')"
            autofocus
            required
            @keyup.enter="create()"
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
            :style="getColor(color)"
            @click="showSelectColor = true"
          />
        </v-form>
      </template>
      <template v-slot:actions>
        <v-btn text :disabled="!valid" @click="create">
          {{ $t("Create") }}
        </v-btn>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";

export default {
  props: {
    projectId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      valid: false,
      showDialog: false,
      showSelectColor: false,
      name: "",
      color: "#000",
      nameRules: [
        (v) => !!v || this.$t("Name is mandatory"),
        (v) => v.length >= 1 || this.$t("Name is too short")
      ]
    };
  },
  methods: {
    open() {
      this.showDialog = true;
    },
    create() {
      Meteor.call(
        "labels.create",
        { projectId: this.projectId, name: this.name, color: this.color },
        (error) => {
          if (error) {
            this.$notifyError(error);
          }
        }
      );
      this.showDialog = false;
    },

    getColor(label) {
      return `background-color: ${label.color}`;
    },

    onSelectColor(color) {
      this.$refs.color.style.backgroundColor = color;
      this.color = color;
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
  border: 1px solid black;
  margin-bottom: 24px;
  cursor: pointer;
}

.btn-color {
  margin-left: 0;
  margin-bottom: 6px;
  width: 100%;
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
