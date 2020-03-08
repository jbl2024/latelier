<template>
  <div class="select-background">
    <generic-dialog
      v-model="showDialog"
      max-width="620"
      :title="$t('Select background')"
    >
      <template v-slot:content>
        <div class="backgrounds-wrapper">
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
        </div>
      </template>
      <template v-slot:actions>
        <v-btn text @click="clearBackground">
          {{ $t("BackgroundNone") }}
        </v-btn>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Backgrounds } from "/imports/api/backgrounds/backgrounds";

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      backgrounds: null
    };
  },
  computed: {
    showDialog: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  },
  mounted() {
    Meteor.call("backgrounds.find", (error, result) => {
      if (result) {
        this.backgrounds = result;
      }
    });
  },
  methods: {
    selectBackground(image) {
      Meteor.call(
        "backgrounds.choose",
        { backgroundId: image._id },
        (error) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.$notify(this.$t("Background updated"));
          this.showDialog = false;
        }
      );
    },

    clearBackground() {
      Meteor.call("backgrounds.clear", (error) => {
        if (error) {
          this.$notifyError(error);
          return;
        }
        this.$notify(this.$t("Background updated"));
        this.showDialog = false;
      });
    },

    thumbnail(background) {
      return Backgrounds.link(background, "thumbnail");
    }
  }
};
</script>

<style scoped>
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
