<template>
  <div class="editable-text">
    <div v-show="!isEdited && hasText" @click="startEditing">
      <div class="tiptap-editor-view" v-html="formattedText" />
    </div>
    <div v-show="emptyText && !hasText && !isEdited" @click="startEditing">
      {{ emptyText }}
    </div>
    <div v-show="isEdited">
      <rich-editor v-if="type === 'rich-editor'" ref="text" v-model="text" @submit="update" />
      <v-text-field
        v-else-if="type === 'text-field'"
        ref="text"
        v-model="text"
        text
        hide-details
        @keyup.enter="update"
      />
      <v-btn icon @click="update">
        <v-icon color="green">
          mdi-check-circle
        </v-icon>
      </v-btn>
      <v-btn icon @click="cancel">
        <v-icon color="red">
          mdi-close-circle
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>
<script>

/*

        */
import MarkdownMixin from "/imports/ui/mixins/MarkdownMixin.js";

export default {
  mixins: [MarkdownMixin],
  props: {
    isEdited: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: "rich-editor"
    },
    emptyText: {
      type: String,
      default: null
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      savedText: null
    };
  },
  computed: {
    text: {
      get() {
        return this.value;
      },
      set(newText) {
        this.$emit("input", newText);
      }
    },
    hasText() {
      return this.text && this.text.length > 0;
    },
    formattedText() {
      if (this.options.markdown === true) {
        return this.markDown(this.text);
      }
      return this.text;
    }
  },
  methods: {
    startEditing() {
      this.savedText = this.text;
      this.$emit("update:is-edited", true);
      this.$nextTick(() => this.$refs.text.focus());
    },
    update() {
      this.$emit("update", this.text, this.savedText);
    },
    cancel() {
      this.$emit("cancel", this.savedText);
    }
  }
};
</script>
