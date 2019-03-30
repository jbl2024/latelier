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
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12>
                  <v-textarea
                    ref="name"
                    class="edit-name"
                    @focus.native="$event.target.select()"
                    label="Titre de la tâche"
                    outline
                    required
                    :rules="nameRules"
                    v-model="name"
                    @keyup.ctrl.enter="updateName"
                  ></v-textarea>
                </v-flex>
                <v-flex xs12>
                  <v-checkbox
                    v-model="multiline"
                    :label="$t('Create one task per line')"
                  ></v-checkbox>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="cancelDialog">{{ $t('Close')}}</v-btn>
          <v-btn color="primary" @click="newTask">{{ $t('Create') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    active: Boolean,
    listId: {
      type: String
    }
  },
  mounted() {
  },
  watch: {
    active(active) {
      if (active) {
        this.$nextTick(() => {
          console.log('fofou')
          this.$refs.name.focus();
        });      
      }
    }
  },
  data() {
    return {
      valid: false,
      nameRules: [v => !!v || "Nom obligatoire"],
      showDialog: false,
      name: "",
      multiline: false
    };
  },
  methods: {
    newTask() {
      
    },
    cancelDialog () {
      this.$emit("update:active", false);
      this.$emit("cancel");
    }
  },
};
</script>

<style scoped>
</style>