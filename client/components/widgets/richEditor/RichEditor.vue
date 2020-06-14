<template>
  <div
    v-click-outside="onClickOutside"
    :class="{
      'tiptap-editor-view': true,
      border: !noBorder,
      'no-border': noBorder,
    }"
    @click="focus"
  >
    <rich-editor-menu-bubble :editor="editor" />
    <rich-editor-floating-menu v-if="floating" menu :editor="editor" />
    <rich-editor-menu-bar v-if="!hideToolbar" :editor="editor" />

    <editor-content
      :editor="editor"
      :class="{
        editor: true,
        dense: dense,
      }"
      :style="getStyle(maxHeight)"
      @keydown.shift.enter="submit"
    />
  </div>
</template>

<script>
import { Editor, EditorContent } from "tiptap";
import {
  Blockquote,
  CodeBlock,
  Heading,
  OrderedList,
  BulletList,
  ListItem,
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
    },
    dense: {
      type: Boolean,
      default: false
    },
    hideToolbar: {
      type: Boolean,
      default: false
    },
    floating: {
      type: Boolean,
      default: false
    },
    maxHeight: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      editor: null,
      content: this.value,
      ctrl: false,
      enter: false
    };
  },
  computed: {
    name() {
      return this.data;
    }
  },
  watch: {
    value() {
      const existingContent = this.editor.getHTML();
      if (existingContent !== this.value) {
        this.editor.setContent(this.value);
      }
    }
  },
  mounted() {
    this.editor = new Editor({
      content: this.content,
      extensions: [
        new Blockquote(),
        new CodeBlock(),
        new Heading({ levels: [1, 2, 3] }),
        new BulletList(),
        new OrderedList(),
        new ListItem(),
        new Bold(),
        new Code(),
        new Italic(),
        new Link(),
        new Strike(),
        new Underline(),
        new History()
      ],
      editorProps: {
        handleKeyDown: (view, event) => {
          if (event.key === "Enter" && event.shiftKey) {
            this.submit();
          }
        }
      },
      onUpdate: ({ getHTML }) => {
        const content = getHTML();
        this.$emit("input", content);
      },
      onFocus: () => {
        this.$emit("on-focus", this);
      },
      onBlur: () => {
        this.$emit("on-blur", this);
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
    },

    submit() {
      this.$emit("submit");
    },

    iconColor(activated) {
      if (activated) {
        return "blue";
      }
      return "primary";
    },

    iconColorDark(activated) {
      if (activated) {
        return "blue";
      }
      return "white";
    },

    getStyle(maxHeight) {
      if (!maxHeight) return "";
      const style = `
        max-height: ${maxHeight};
        overflow-y: auto;
      `;
      return style;
    }
  }
};
</script>

<style lang="scss" scoped>
.border {
  border: 1px solid #ccc;
}

.no-border {
  border: none;
}

.toolbar {
  border-bottom: 1px solid #ccc;
  padding: 8px;
}

.editor {
  padding: 8px;
  min-height: 120px;
  &__floating-menu {
    position: absolute;
    z-index: 1;
    margin-left: 24px;
    margin-top: -1px;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.2s, visibility 0.2s;
    &.is-active {
      opacity: 1;
      visibility: visible;
    }
  }
}

.menubar {
  border-bottom: 1px solid #ccc;
  padding: 8px;
  margin-bottom: 0.5rem;
  transition: visibility 0.2s 0.4s, opacity 0.2s 0.4s;

  &.is-hidden {
    display: none;
    opacity: 0;
  }

  &.is-focused {
    display: block;
    opacity: 1;
    transition: visibility 0.2s, opacity 0.2s;
  }

  &__button {
    font-weight: bold;
    display: inline-flex;
    background: transparent;
    border: 0;
    color: black;
    padding: 0.2rem 0.5rem;
    margin-right: 0.2rem;
    border-radius: 3px;
    cursor: pointer;

    &:hover {
      background-color: rgba(black, 0.05);
    }

    &.is-active {
      background-color: rgba(black, 0.1);
    }
  }

  span#{&}__button {
    font-size: 13.3333px;
  }
}
.dense {
  min-height: 72px;
}

.small-medium {
  font-size: 18px !important;
}

.xx-small {
  height: 20px;
  width: 20px;
}
</style>

<style>
.ProseMirror-focused {
  outline: none;
}
</style>
