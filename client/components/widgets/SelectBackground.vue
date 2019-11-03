<template>
  <div class="select-background">
    <v-dialog
      :value="active"
      max-width="620"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      @input="$emit('update:active')"
    >
      <v-toolbar dark color="primary">
        <v-btn
          v-shortkey="['esc']"
          icon
          text
          @click="closeDialog()"
          @shortkey="closeDialog()"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>
          {{ $t("Select background") }}
        </v-toolbar-title>
      </v-toolbar>
      <v-card>
        <v-card-text class="backgrounds-wrapper">
          <div class="backgrounds">
            <v-card
              v-for="image in backgrounds"
              :key="image._id"
              max-width="344"
              tile
              class="mx-auto background-card"
              @keyup.enter.native="selectBackground(image)"
              @click="selectBackground(image)"
            >
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title class="headline">
                    {{ image.meta.name }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-img
                :src="thumbnail(image)"
                :alt="image.meta.name"
                height="194"
              />

              <v-card-text v-html="image.meta.credits" />
            </v-card>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="error" text @click="clearBackground">
            {{ $t("BackgroundNone") }}
          </v-btn>
          <v-spacer />
          <v-btn text @click="closeDialog">
            {{ $t("Cancel") }}
          </v-btn>
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
    active: Boolean
  },
  data() {
    return {
      backgrounds: undefined
    };
  },
  mounted() {
    Meteor.call("backgrounds.find", (error, result) => {
      if (result) {
        this.backgrounds = result;
      }
    });
  },
  methods: {
    closeDialog() {
      this.$emit("update:active", false);
    },

    selectBackground(image) {
      Meteor.call(
        "backgrounds.choose",
        { backgroundId: image._id },
        (error) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.$store.dispatch("notify", this.$t("Background updated"));
          this.$emit("update:active", false);
        }
      );
    },

    clearBackground() {
      Meteor.call("backgrounds.clear", (error) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.$store.dispatch("notify", this.$t("Background updated"));
        this.$emit("update:active", false);
      });
    },

    thumbnail(background) {
      return Backgrounds.link(background, "thumbnail");
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

.backgrounds-wrapper {
  -webkit-overflow-scrolling: touch;
}

@media (min-width: 601px) {
  .backgrounds-wrapper {
    height: calc(100vh - 200px);
    min-height: 360px;
    max-height: 530px;
    overflow-y: scroll;
  }
}

@media (max-width: 600px) {
  .backgrounds-wrapper {
    height: 440px;
    overflow-y: scroll;
  }
}

.backgrounds {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  -webkit-overflow-scrolling: touch;
}

.background-card {
  margin: 12px;
}
</style>
