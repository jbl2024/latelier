<template>
  <editor-content :editor="editor" />
  <!-- <vue-editor
    ref="editor"
    v-model="content"
    v-click-outside="onClickOutside"
    :class="{ editor: true, 'no-border': noBorder }"
    :editor-options="editorSettings"
    :editor-toolbar="customToolbar"
  /> -->
</template>

<script>
import { Editor, EditorContent } from "tiptap";
// import { VueEditor } from "vue2-editor";

export default {
  components: {
    EditorContent
  },
  props: {
    value: {
      type: String,
      default: ""
    },
    autofocus: {
      type: Boolean,
      default: false
    },
    noBorder: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      editor: null,
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
  watch: {
    value() {
      const value = this.editor.getHTML();
      if (value !== this.value) {
        this.editor.setContent(value);
      }
    }
  },
  mounted() {
    this.editor = new Editor({
      content: this.content,
      onUpdate: ({ getHTML }) => {
        const content = getHTML();
        this.$emit("input", content);
      }
    });
    if (this.autofocus) {
      this.$nextTick(() => {
        this.focus();
      });
    }
  },
  beforeDestroy() {
    this.editor.destroy();
  },
  methods: {
    focus() {
      this.editor.focus();
    },
    onClickOutside() {
      this.$emit("click-outside");
    }
  }
};
</script>
