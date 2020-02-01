<template>
  <div class="edit-process-diagram">
    <v-dialog
      v-model="showDialog"
      max-width="420"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <v-card>
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
            <span>{{ $t("Edit example") }}</span>
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-form v-model="valid" @submit.prevent>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field
                  ref="name"
                  v-model="name"
                  :rules="nameRules"
                  :label="$t('Name')"
                  required
                />
              </v-flex>
              <v-flex xs12>
                <label>{{ $t("Description") }}</label>
                <rich-editor ref="description" v-model="description" />
              </v-flex>
              <v-flex xs12>
                <label>{{ $t("XML") }}</label>
                <v-textarea ref="xml" v-model="xml" />
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showDialog = false">
            {{ $t("Cancel") }}
          </v-btn>
          <v-btn color="primary" :disabled="!valid" @click="update">
            {{ $t("Update") }}
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
  data() {
    return {
      example: {},
      showDialog: false,
      valid: false,
      name: "",
      nameRules: [
        (v) => !!v || this.$t("Name is mandatory"),
        (v) => v.length > 1 || this.$t("Name is too short")
      ],
      description: "",
      xml: ""
    };
  },
  methods: {
    open(example) {
      this.example = example;
      this.name = this.example.name;
      this.description = this.example.description;
      this.xml = this.example.xml;
      this.showDialog = true;
      this.$nextTick(() => autofocus.focus(this.$refs.name));
    },
    close() {
      this.showDialog = false;
    },

    update() {
      this.showDialog = false;
      Meteor.call(
        "bpmnExamples.update",
        {
          exampleId: this.example._id,
          name: this.name,
          description: this.description,
          xml: this.xml
        },
        (error) => {
          if (error) {
            this.$notifyError(error);
          }
          this.$emit("updated");
        }
      );
      this.showDialog = false;
    }
  }
};
</script>

<style scoped></style>
