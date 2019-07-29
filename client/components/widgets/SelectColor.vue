<template>
  <div class="select-color">
    <v-dialog :value="active" @input="$emit('update:active')" persistent max-width="320" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-card-title class="headline">Choisir une couleur</v-card-title>
        <swatches-picker :value="color" @input="selectColor" />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="closeDialog">{{ this.$t('Cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Swatches } from "vue-color";

export default {
  components: {
    "swatches-picker": Swatches
  },
  props: {
    active: Boolean
  },
  data() {
    return {
      color: ""
    };
  },
  methods: {
    closeDialog() {
      this.$emit("update:active", false);
    },

    selectColor(color) {
      this.$emit("update:active", false);
      this.$emit("select", color);
    }
  }
};
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
  overflow-y: scroll;
}

.cursor {
  cursor: pointer;
}

.cursor:hover {
  background-color: #aaa;
}
</style>