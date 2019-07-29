<template>
  <div class="new-task">
    <v-dialog
      :value="active"
      @input="$emit('update:active')"
      max-width="640"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <v-card>
        <v-card-title class="headline">{{ $t('Add new task') }}</v-card-title>
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
                    @keydown.shift.enter="newTask(false)"
                  ></v-textarea>
                </v-flex>
                <v-flex xs12>
                  <task-labels-in-new-task :project-id="projectId" v-model="labels"></task-labels-in-new-task>
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
          <v-btn color="primary" @click="newTask(false)" :disabled="!valid || loading">{{ $t('Create') }}</v-btn>
          <v-btn color="primary" @click="newTask(true)" :disabled="!valid || loading">{{ $t('Create and add') }}</v-btn>
        </v-card-actions>

        <v-card-actions class="show-mobile">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="newTask(false)" :disabled="!valid || loading">{{ $t('Create') }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="newTask(true)" :disabled="!valid || loading">{{ $t('Create and add') }}</v-btn>
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
    projectId: {
      type: String
    },
    listId: {
      type: String
    }
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
        v => (v && v.length > 0) || this.$t('Name is too short')
      ],
      showDialog: false,
      name: "",
      multiline: false,
      showMultilineOption: false,
      labels: [],
      loading: false
    };
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
          this.labels.map(l => {return l._id}),
          (error, task) => {
            this.loading = false;
            if (error) {
              this.$store.dispatch("notifyError", error);
              return;
            } else {
              this.$store.dispatch("notify", this.$t('Task created'));
              this.reset();
              if (!keep) {
                this.close();
                this.$router.push({
                  name: 'project-task',
                  params: {
                    projectId: this.projectId,
                    taskId: task._id
                  }
                })
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
            this.loading = true;
            const labelIds = this.labels.map(l => {return l._id});
            tasks.map(name => {
              Meteor.call(
                "tasks.insert",
                list.projectId,
                this.listId,
                name,
                labelIds,
                (error, task) => {
                  if (error) {
                    this.$store.dispatch("notifyError", error);
                    return;
                  }
                }
              );
              this.loading = false;
              this.reset();
              if (!keep) {
                this.close();
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