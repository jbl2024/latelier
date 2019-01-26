<template>
  <vue-editor
    class="editor"
    v-model="content"
    ref="editor"
    @keyup.ctrl.enter="addNote"
    :editorToolbar="customToolbar"
  ></vue-editor>
</template>

<script>
import { VueEditor } from "vue2-editor";

export default {
  components: {
    VueEditor
  },
  props: {
    value: {
      type: String,
      default: ""
    }
  },
  watch: {
    content(content) {
      this.$emit("input", content);
    },
    value(value) {
      if (this.$refs.editor.quill.root.innerHTML !== this.value) {
        this.$refs.editor.quill.root.innerHTML = this.value;
      }
    }
  },
  data() {
    return {
      content: this.value,
      customToolbar: [
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["code-block", "blockquote"]
      ]
    };
  },
  methods: {
    focus() {
      this.$refs.editor.quill.focus();
    }
  },
};
</script>

<style>
.ql-toolbar svg {
  width: 16px !important;
  height: 16px !important;
}
</style>
