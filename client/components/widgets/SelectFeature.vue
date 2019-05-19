<template>
  <div class="select-feature">

    <v-dialog :value="active" @input="$emit('update:active')" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-card-title class="headline">{{ $t('Choose feature') }}</v-card-title>
        <v-card-text>
          <v-list class="content">
            <template v-for="feature in features">
              <v-list-tile :key='feature' @click="selectFeature(feature)">
                <v-list-tile-avatar >
                  <v-icon>folder</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content class="cursor">
                  <v-list-tile-title>{{ feature }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="closeDialog">{{ $t('Cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>    
</template>

<script>
import { Meteor } from 'meteor/meteor'

export default {
  i18n: {
    messages: {
      en: {
        "Choose feature": "Choose feature"
      },
      fr: {
        "Choose feature": "Sélectionner une fonctionnalité"
      }
    }
  },
  props: {
    projectId: String,
    active: Boolean,
  },
  data () {
    return {
      features: ['estimation']
    }
  },
  methods: {
    closeDialog () {
      this.$emit('update:active', false);
    },

    selectFeature (feature) {
      this.$emit('update:active', false);
      this.$emit('select', feature);
    }

  }
}
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

</style>