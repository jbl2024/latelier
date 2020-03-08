<template>
  <div class="new-organization">
    <generic-dialog
      v-model="showDialog"
      max-width="420"
      :title="$t('New organization')"
    >
      <template v-slot:content>
        <v-form v-model="valid" @submit.prevent>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="name"
                  v-col
                  autofocus
                  :rules="nameRules"
                  :label="$t('Name')"
                  required
                  @keyup.enter="create()"
                />
              </v-col>
            </v-row>
          </v-container>
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
    },
    create() {
      Meteor.call(
        "organizations.create",
        { name: this.name },
        (error, result) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.showDialog = false;
          this.$router.push({
            name: "projects-page",
            params: { organizationId: result }
          });
        }
      );
    }
  }
};
</script>
