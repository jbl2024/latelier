<template>
  <div class="select-background">

    <v-dialog :value="active" @input="$emit('update:active')" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-card-title class="headline">{{ $t('Select background') }}</v-card-title>
        <v-card-text>
          <v-list class="content" v-if="backgrounds">
            <template v-for="image in backgrounds">
              <v-list-tile :key='image._id' @click="selectBackground(image)">
                <v-list-tile-avatar>
                  <span class=""></span>
                </v-list-tile-avatar>
                <v-list-tile-content class="pointer">
                  <v-list-tile-title>{{ image.meta.name }} </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
            <v-divider></v-divider>
            <v-list-tile @click="clearBackground()">
              <v-list-tile-avatar>
                <span class=""></span>
              </v-list-tile-avatar>
              <v-list-tile-content class="pointer">
                <v-list-tile-title>{{ $t('None') }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="closeDialog">{{ $t('Cancel') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Backgrounds } from "/imports/api/backgrounds/backgrounds";

export default {
  props: {
    active: Boolean,
  },
  mounted() {
    Meteor.call('backgrounds.find', (error, result) => {
      if (result) {
        this.backgrounds = result;
      }
    })
  },
  data() {
    return {
      backgrounds: undefined,
    };
  },
  i18n: {
    messages: {
      en: { 
        "Select background": "Select background",
        "None": "None",
        "Background updated": "Background updated",
      },
      fr: {
        "Select background": "Sélectionner un fond d'écran",
        "None": "Aucun",
        "Background updated": "Fond mis à jour",
      }
    }  
  },  
  methods: {
    closeDialog() {
      this.$emit("update:active", false);
    },

    selectBackground(image) {
      Meteor.call("backgrounds.choose", {backgroundId: image._id}, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.$store.dispatch("notify", this.$t("Background updated"));
        this.$emit("update:active", false);
      });
    },

    clearBackground() {
      Meteor.call("backgrounds.clear", (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.$store.dispatch("notify", this.$t("Background updated"));
        this.$emit("update:active", false);
      });
    }
  }
};
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
  overflow-y: scroll;
  max-height: 300px;
}

.cursor {
  cursor: pointer;
}

.cursor:hover {
  background-color: #aaa;
}

.avatar {
  background-color: rgba(0, 0, 0, 0.14);
  border-radius: 50%;
  width: 38px;
  height: 38px;
  padding-top: 8px;
}
</style>