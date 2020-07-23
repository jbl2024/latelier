<template>
  <div class="meeting-agenda">
    <v-container class="container">
      <editable-text
        v-model="editedAgenda"
        :is-edited.sync="isAgendaEdited"
        :empty-text="$t('meetings.agenda.none')"
        :options="{ markdown: true }"
        @update="updateAgenda"
        @cancel="cancelUpdateAgenda"
      />
    </v-container>
  </div>
</template>
<script>
import EditableText from "/imports/ui/widgets/EditableText";

export default {
  components: {
    EditableText
  },
  props: {
    value: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      isAgendaEdited: true
    };
  },
  computed: {
    editedAgenda: {
      get() {
        return this.value;
      },
      set(newAgenda) {
        this.$emit("input", newAgenda);
      }
    }
  },
  methods: {
    updateAgenda(agenda) {
      this.isAgendaEdited = false;
      this.editedAgenda = agenda;
    },
    cancelUpdateAgenda(savedAgenda) {
      this.isAgendaEdited = false;
      this.editedAgenda = savedAgenda;
    }
  }
};
</script>
<style lang="scss">
  .meeting-agenda {
    .editor {
      min-height: 300px;
    }
  }
</style>
