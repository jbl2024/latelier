<template>
  <div class="new-organization">
    <v-dialog
      v-model="showDialog"
      max-width="420"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t("New organization") }}
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

export default {
  data() {
    return {
      showDialog: false,
      projectType: "none",
      valid: false,
      name: "",
      nameRules: [
        (v) => !!v || this.$t("Name is mandatory"),
        (v) => v.length > 1 || this.$t("Name is too short")
      ]
    };
  },
  methods: {
    open() {
      this.showDialog = true;
      this.$nextTick(() => this.$refs.name.focus());
    },
    create() {
      Meteor.call(
        "organizations.create",
        { name: this.name },
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.$router.push({
            name: "projects-page",
            params: { organizationId: result }
          });
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
