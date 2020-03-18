<template>
  <div
    v-click-outside="onClickOutside"
    :class="{
      'tiptap-editor-view': true,
      border: !noBorder,
      'no-border': noBorder
    }"
    @click="focus"
  >
    <editor-menu-bar v-slot="{ commands, isActive }" :editor="editor">
      <div class="toolbar">
        <button @click="commands.bold">
          <v-icon class="small-medium" :color="iconColor(isActive.bold())">
            mdi-format-bold
          </v-icon>
        </button>
        <button @click="commands.italic">
          <v-icon class="small-medium" :color="iconColor(isActive.italic())">
            mdi-format-italic
          </v-icon>
        </button>
        <button @click="commands.underline">
          <v-icon class="small-medium" :color="iconColor(isActive.underline())">
            mdi-format-underline
          </v-icon>
        </button>
        <button @click="commands.strike">
          <v-icon class="small-medium" :color="iconColor(isActive.strike())">
            mdi-format-strikethrough
          </v-icon>
        </button>
        <button @click="commands.ordered_list">
          <v-icon
            class="small-medium"
            :color="iconColor(isActive.ordered_list())"
          >
            mdi-format-list-numbered
          </v-icon>
        </button>
        <button @click="commands.bullet_list">
          <v-icon
            class="small-medium"
            :color="iconColor(isActive.bullet_list())"
          >
            mdi-format-list-bulleted
          </v-icon>
        </button>
        <button @click="commands.code_block">
          <v-icon
            class="small-medium"
            :color="iconColor(isActive.code_block())"
          >
            mdi-xml
          </v-icon>
        </button>
        <button @click="commands.blockquote">
          <v-icon
            class="small-medium"
            :color="iconColor(isActive.blockquote())"
          >
            mdi-format-quote-close
          </v-icon>
        </button>
        <button @click="commands.heading({ level: 1 })">
          <v-icon
            class="small-medium"
            :color="iconColor(isActive.heading({ level: 1 }))"
          >
            mdi-format-header-1
          </v-icon>
        </button>
        <button @click="commands.heading({ level: 2 })">
          <v-icon
            class="small-medium"
            :color="iconColor(isActive.heading({ level: 2 }))"
          >
            mdi-format-header-2
          </v-icon>
        </button>
        <button @click="commands.heading({ level: 3 })">
          <v-icon
            class="small-medium"
            :color="iconColor(isActive.heading({ level: 3 }))"
          >
            mdi-format-header-3
          </v-icon>
        </button>
      </div>
    </editor-menu-bar>
    <editor-content
      :editor="editor"
      :class="{
        editor: true,
        dense: dense
      }"
      :style="getStyle(maxHeight)"
      @keydown.shift.enter="submit"
    />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from "tiptap";
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
    },
    dense: {
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

<style scoped>
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
}

.dense {
  min-height: 72px;
}

.small-medium {
  font-size: 18px !important;
}
</style>

<style>
.ProseMirror-focused {
  outline: none;
}
</style>
