<template>
  <div class="new-task">
    <v-dialog
      :value="active"
      max-width="640"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      @input="$emit('update:active')"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t("Add new task") }}
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid" class="form" @submit.prevent>
            <v-layout wrap>
              <v-flex xs12>
                <v-textarea
                  ref="name"
                  v-model="name"
                  class="edit-name"
                  :label="$t('Title')"
                  outlined
                  required
                  :rules="nameRules"
                  @focus.native="$event.target.select()"
                  @keydown.shift.enter="newTask(false)"
                />
              </v-flex>
              <v-flex xs12>
                <task-labels-in-new-task
                  v-model="labels"
                  :project-id="projectId"
                />
              </v-flex>
              <v-flex xs12>
                <v-checkbox
                  v-model="multiline"
                  :class="{ hidden: !showMultilineOption }"
                  :label="$t('Create one task per line')"
                />
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>

        <v-card-actions class="show-desktop">
          <v-spacer />
          <v-btn text @click="close">
            {{ $t("Cancel") }}
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!valid || loading"
            @click="newTask(false)"
          >
            {{ $t("Create") }}
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!valid || loading"
            @click="newTask(true)"
          >
            {{ $t("Create and add") }}
          </v-btn>
        </v-card-actions>

        <v-card-actions class="show-mobile">
          <v-spacer />
          <v-btn
            color="primary"
            :disabled="!valid || loading"
            @click="newTask(false)"
          >
            {{ $t("Create") }}
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            :disabled="!valid || loading"
            @click="newTask(true)"
          >
            {{ $t("Create and add") }}
          </v-btn>
          <v-spacer />
        </v-card-actions>

        <v-card-actions class="show-mobile">
          <v-spacer />
          <v-btn text @click="close">
            {{ $t("Cancel") }}
          </v-btn>
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
        "Tasks created": "Task created"
      },
      fr: {
        Title: "Titre",
        "Really create {count} tasks?": "Vous allez créer {count} tâches",
        "Create {count} tasks": "Créer {count} tâches",
        "Create one task per line": "Créer une tâche par ligne",
        "Create and add": "Créer et ajouter",
        "Task created": "Tâche créée",
        "Tasks created": "Tâches créées"
      }
    }
  },
  props: {
    active: Boolean,
    projectId: {
      type: String,
      default: ""
    },
    listId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      valid: false,
      nameRules: [
        (v) => !!v || "Nom obligatoire",
        (v) => (v && v.length > 0) || this.$t("Name is too short")
      ],
      showDialog: false,
      name: "",
      multiline: false,
      showMultilineOption: false,
      labels: [],
      loading: false
    };
  },
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
      tasks = tasks.filter((aName) => aName && aName.length > 0);
      if (tasks.length > 1) {
        this.showMultilineOption = true;
      } else {
        this.showMultilineOption = false;
      }
    }
  },
  methods: {
    reset() {
      this.name = "";
      this.multiline = false;
      this.labels = [];
      this.$nextTick(() => {
        this.$refs.name.focus();
      });
    },
    newTask(keep) {
      const list = Lists.findOne({ _id: this.listId });
      if (!this.multiline) {
        this.loading = true;
        Meteor.call(
          "tasks.insert",
          list.projectId,
          this.listId,
          this.name,
          this.labels.map((l) => l._id),
          (error, task) => {
            this.loading = false;
            if (error) {
              this.$store.dispatch("notifyError", error);
              return;
            }
            this.$store.dispatch("notify", this.$t("Task created"));
            this.reset();
            if (!keep) {
              this.close();
              this.$router.push({
                name: "project-task",
                params: {
                  projectId: this.projectId,
                  taskId: task._id
                }
              });
            }
          }
        );
      } else {
        let tasks = this.name.split(/\r?\n/g) || [];
        tasks = tasks.filter((name) => name && name.length > 0);
        this.$confirm(
          this.$t("Really create {count} tasks?", { count: tasks.length }),
          {
            title: this.$t("Confirmation"),
            cancelText: this.$t("Cancel"),
            confirmText: this.$t("Create {count} tasks", {
              count: tasks.length
            })
          }
        ).then((res) => {
          if (res) {
            this.loading = true;
            const labelIds = this.labels.map((l) => l._id);
            tasks.forEach((name) => {
              Meteor.call(
                "tasks.insert",
                list.projectId,
                this.listId,
                name,
                labelIds,
                (error) => {
                  if (error) {
                    this.$store.dispatch("notifyError", error);
                  }
                }
              );
              this.loading = false;
              this.reset();
              if (!keep) {
                this.close();
              }
            });
            this.$store.dispatch("notify", this.$t("Tasks created"));
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
