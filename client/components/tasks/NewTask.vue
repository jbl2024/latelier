<template>
  <div class="new-task">
    <v-dialog
      :value="active"
      @input="$emit('update:active')"
      max-width="640"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <v-card>
        <v-card-title class="headline">{{ $t('New task') }}</v-card-title>
        <v-card-text>
          <v-form v-model="valid" class="form" v-on:submit.prevent>
              <v-layout wrap>
                <v-flex xs12>
                  <v-textarea
                    ref="name"
                    class="edit-name"
                    @focus.native="$event.target.select()"
                    :label="$t('Title')"
                    outline
                    required
                    :rules="nameRules"
                    v-model="name"
                    @keyup.ctrl.enter="newTask(false)"
                  ></v-textarea>
                </v-flex>
                <v-flex xs12>
                  <v-checkbox
                    :class="{ hidden: !showMultilineOption }"
                    v-model="multiline"
                    :label="$t('Create one task per line')"
                  ></v-checkbox>
                </v-flex>
              </v-layout>
          </v-form>
        </v-card-text>

        <v-card-actions class="show-desktop">
          <v-spacer></v-spacer>
          <v-btn flat @click="close">{{ $t('Cancel')}}</v-btn>
          <v-btn color="primary" @click="newTask(false)" :disabled="!valid">{{ $t('Create') }}</v-btn>
          <v-btn color="primary" @click="newTask(true)" :disabled="!valid">{{ $t('Create and add') }}</v-btn>
        </v-card-actions>

        <v-card-actions class="show-mobile">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="newTask(false)" :disabled="!valid">{{ $t('Create') }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="newTask(true)" :disabled="!valid">{{ $t('Create and add') }}</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>

        <v-card-actions class="show-mobile">
          <v-spacer></v-spacer>
          <v-btn flat @click="close">{{ $t('Cancel')}}</v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Lists } from "/imports/api/lists/lists.js";
export default {
  i18n: {
    messages: {
      en: {
        "New task": "New task",
        Title: "Title",
        "Really create {count} tasks?": "Really create {count} tasks?",
        "Create {count} tasks": "Create {count} tasks",
        "Create one task per line": "Create one task per line",
        "Create and add": "Create and add",
        "Task created": "Task created",
        "Tasks created": "Task created",
      },
      fr: {
        "New task": "Nouvelle tâche",
        Title: "Titre",
        "Really create {count} tasks?": "Vous allez créer {count} tâches",
        "Create {count} tasks": "Créer {count} tâches",
        "Create one task per line": "Créer une tâche par ligne",
        "Create and add": "Créer et ajouter",
        "Task created": "Tâche créée",
        "Tasks created": "Tâches créées",
      }
    }
  },
  props: {
    active: Boolean,
    listId: {
      type: String
    }
  },
  mounted() {},
  watch: {
    active(active) {
      if (active) {
        this.$nextTick(() => {
          this.$refs.name.focus();
        });
      }
    },
    name(name) {
      let tasks = name.split(/\r?\n/g) || [];
      tasks = tasks.filter(name => {
        return name && name.length > 0;
      });
      if (tasks.length > 1) {
        this.showMultilineOption = true;
      } else {
        this.showMultilineOption = false;
      }
    }
  },
  data() {
    return {
      valid: false,
      nameRules: [
        v => !!v || "Nom obligatoire",
        v => (v && v.length > 0) || "Le nom est trop court"
      ],
      showDialog: false,
      name: "",
      multiline: false,
      showMultilineOption: false
    };
  },
  methods: {
    reset() {
      this.name = "";
      this.$nextTick(() => {
        this.$refs.name.focus();
      });
    },
    newTask(keep) {
      const list = Lists.findOne({ _id: this.listId });
      if (!this.multiline) {
        Meteor.call(
          "tasks.insert",
          list.projectId,
          this.listId,
          this.name,
          (error, task) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
              return;
            } else {
              this.$store.dispatch("notify", this.$t('Task created'));
              if (!keep) {
                this.close();
              } else {
                this.reset();
              }
            }
          }
        );
      } else {
        let tasks = this.name.split(/\r?\n/g) || [];
        tasks = tasks.filter(name => {
          return name && name.length > 0;
        });
        this.$confirm(
          this.$t("Really create {count} tasks?", { count: tasks.length }),
          {
            title: this.$t("Confirmation"),
            cancelText: this.$t("Cancel"),
            confirmText: this.$t("Create {count} tasks", {
              count: tasks.length
            })
          }
        ).then(res => {
          if (res) {
            tasks.map(name => {
              Meteor.call(
                "tasks.insert",
                list.projectId,
                this.listId,
                name,
                (error, task) => {
                  if (error) {
                    this.$store.dispatch("notifyError", error);
                    return;
                  }
                }
              );
              if (!keep) {
                this.close();
              } else {
                this.reset();
              }
            });
            this.$store.dispatch("notify", this.$t('Tasks created'));
          }
        });
      }
    },
    close() {
      this.$emit("update:active", false);
      this.$emit("cancel");
    }
  }
};
</script>

<style scoped>
.hidden {
  visibility: hidden;
}
</style>