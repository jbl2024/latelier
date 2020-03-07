<template>
  <div>
    <editor-menu-bar v-slot="{ commands, isActive }" :editor="editor">
      <div>
        <button
          :class="{ 'is-active': isActive.bold() }"
          @click="commands.bold"
        >
          Bold
        </button>
        <button
          :class="{ 'is-active': isActive.heading({ level: 2 }) }"
          @click="commands.heading({ level: 2 })"
        >
          H2
        </button>
      </div>
    </editor-menu-bar>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from "tiptap";
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  History
} from "tiptap-extensions";

export default {
  components: {
    EditorContent,
    EditorMenuBar
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
      extensions: [
        new Blockquote(),
        new CodeBlock(),
        new HardBreak(),
        new Heading({ levels: [1, 2, 3] }),
        new BulletList(),
        new OrderedList(),
        new ListItem(),
        new TodoItem(),
        new TodoList(),
        new Bold(),
        new Code(),
        new Italic(),
        new Link(),
        new Strike(),
        new Underline(),
        new History()
      ],
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
