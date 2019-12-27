<template>
  <v-dialog
    v-model="showDialog"
    class="detail"
    max-width="640"
    fullscreen
  >
    <v-card class="new-user">
      <v-toolbar dark color="primary">
        <v-btn
          v-shortkey="['esc']"
          icon
          text
          @click="close()"
          @shortkey="close()"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>
          <span>{{ $t("New activity") }}</span>
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form v-model="valid" class="form" @submit.prevent>
          <v-container fluid>
            <v-col cols="12">
              <v-text-field
                v-model="activity.name"
                :label="$t('Name') + '*'"
                required
                :rules="nameRules"
              />
            </v-col>
            <v-col cols="12">
              <label>{{ $t("Description") }}</label>
              <rich-editor
                v-model="activity.description"
                class="editor"
              />
            </v-col>
            <v-col cols="12">
              <label>{{ $t("Goals") }}</label>
              <rich-editor
                v-model="activity.goals"
                class="editor"
              />
            </v-col>
          </v-container>
        </v-form>
        <small>*indique un champ obligatoire</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click.native="close()">
          {{ this.$t("Close") }}
        </v-btn>
        <v-btn color="primary" :disabled="!valid" @click.native="create()">
          {{ $t("Create") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {},
  data() {
    return {
      valid: false,
      nameRules: [
        (v) => !!v || this.$t("Name is mandatory"),
        (v) => v.length > 1 || this.$t("Name is too short")
      ],
      showDialog: false,
      activity: {
        name: "",
        goals: "",
        stages: [],
        description: "",
        setup: "",
        steps: "",
        duration: "",
        resources: "",
        difficulty: "",
        location: "",
        members: ""
      }
    };
  },
  methods: {
    open() {
      this.showDialog = true;
    },
    close() {
      this.showDialog = false;
    },
    create() {
      Meteor.call("workshops.activities.create", {
        name: this.activity.name,
        description: this.activity.description,
        goals: this.activity.goals
      }, (error) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.$store.dispatch("notify", this.$t("Activity created"));
        this.close();
        this.$emit("created");
      });
    }
  }
};
</script>

<style scoped>
.deactivated {
  font-weight: bold;
}
</style>
