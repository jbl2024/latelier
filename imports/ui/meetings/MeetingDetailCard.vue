<template>
  <v-card
    v-if="meeting"
  >
    <v-list-item>
      <v-list-item-avatar color="grey">
        <v-icon>mdi-play</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title class="headline">
          {{ meeting.name }}
        </v-list-item-title>
        <v-list-item-subtitle />
      </v-list-item-content>
    </v-list-item>
    <v-card-text v-if="meeting.description" v-html="meeting.description" />
    <v-card-text>
      <h2>{{ $t('meetings.sections.agenda') }}</h2>
      <rich-editor
        v-model="meeting.agenda"
        class="editor"
        floating
        hide-toolbar
      />
    </v-card-text>
    <v-card-text>
      <h2>{{ $t('meetings.sections.report') }}</h2>
      <rich-editor
        v-model="meeting.report"
        class="editor"
        floating
        hide-toolbar
      />
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  props: {
    meeting: {
      type: Object,
      default: null
    }
  }
};
</script>

<style scoped>

.editor {
  color: black;
  font-size: 18px;
}

</style>
