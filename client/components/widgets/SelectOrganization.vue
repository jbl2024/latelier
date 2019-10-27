<template>
  <div class="select-organization">
    <v-dialog
      :value="active"
      max-width="420"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      @input="$emit('update:active')"
    >
      <v-card>
        <v-card-title class="headline">
          Choisir une organisation
        </v-card-title>
        <v-card-text>
          <v-list class="content">
            <template v-for="organization in organizations">
              <v-list-item
                :key="organization._id"
                @click="selectOrganization(organization)"
              >
                <v-list-item-avatar>
                  <v-icon>mdi-domain</v-icon>
                </v-list-item-avatar>
                <v-list-item-content class="pointer">
                  <v-list-item-title>{{ organization.name }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
            <v-divider />
            <v-list-item @click="selectOrganization()">
              <v-list-item-avatar>
                <v-icon />
              </v-list-item-avatar>
              <v-list-item-content class="pointer" />
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">
            {{ this.$t("Cancel") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Organizations } from "/imports/api/organizations/organizations.js";

export default {
  props: {
    active: Boolean
  },
  i18n: {
    messages: {
      en: {
        None: "None"
      },
      fr: {
        None: "Aucune"
      }
    }
  },
  data() {
    return {};
  },
  meteor: {
    organizations() {
      return Organizations.find(
        { orphans: { $exists: false } },
        { sort: { name: 1 } }
      );
    }
  },
  methods: {
    closeDialog() {
      this.$emit("update:active", false);
    },

    selectOrganization(organization) {
      this.$emit("update:active", false);
      this.$emit("select", organization);
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
