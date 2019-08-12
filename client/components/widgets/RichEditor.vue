<template>
  <vue-editor
    class="editor"
    v-model="content"
    ref="editor"
    :editorOptions="editorSettings"
    :editorToolbar="customToolbar"
  ></vue-editor>
</template>

<script>
import { VueEditor } from "vue2-editor";
import _Quill from "quill";

export default {
  components: {
    VueEditor
  },
  props: {
    value: {
      type: String,
      default: ""
    },
    autofocus: {
      type: Boolean,
      default: false
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
  mounted() {
    if (this.autofocus) {
      this.$nextTick(() => {
        this.focus();
      })
    }
  },
  data() {
    return {
      content: this.value,
      customToolbar: [
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["code-block", "blockquote"]
      ],
      editorSettings: {
        modules: {
          keyboard: {
            bindings: {
              tab: {
                key: "enter",
                shiftKey: true,
                handler: () => {
                  this.$emit("submit");
                }
              }
            }
          }
        }
      }
    };
  },
  methods: {
    focus() {
      this.$refs.editor.quill.focus();
    }
  }
};
</script>

<style scoped>
</style>
<style>
.ql-toolbar svg {
  width: 16px !important;
  height: 16px !important;
}

.ql-editor {
  min-height:120px;
}

</style>
