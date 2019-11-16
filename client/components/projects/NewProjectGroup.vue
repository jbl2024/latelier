<template>
  <div class="new-project-group">
    <v-dialog
      v-model="showDialog"
      max-width="420"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <v-card>
        <v-card-title class="headline">
          Nouvelle catégorie
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid" @submit.prevent>
            <v-text-field
              ref="name"
              v-model="name"
              :rules="nameRules"
              :label="$t('Name')"
              required
              @keyup.enter="create()"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showDialog = false">
            {{ this.$t("Cancel") }}
          </v-btn>
          <v-btn color="info" :disabled="!valid" @click="create">
            {{ this.$t("Create") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { autofocus } from "/imports/ui/autofocus";

export default {
  props: {
    organizationId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      showDialog: false,
      valid: false,
      name: "",
      nameRules: [
        (v) => !!v || this.$t("Name is mandatory"),
        (v) => v.length > 0 || this.$t("Name is too short")
      ]
    };
  },
  methods: {
    open() {
      this.showDialog = true;
      this.$nextTick(() => {
        autofocus.focus(this.$refs.name);
      });
    },
    create() {
      Meteor.call(
        "projectGroups.create",
        this.organizationId,
        this.name,
        (error) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
          }
        }
      );
      this.showDialog = false;
    }
  }
};
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
}
</style>
