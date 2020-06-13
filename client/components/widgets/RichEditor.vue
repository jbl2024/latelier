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
    <editor-menu-bubble
      v-slot="{ commands, isActive, menu }"
      keep-in-bounds
      :editor="editor"
    >
      <v-toolbar
        dark
        dense
        floating
        class="editor__bubble-menu"
        :class="{ 'is-active': menu.isActive }"
        :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
      >
        <button @click="commands.heading({ level: 1 })">
          <v-icon :color="iconColorDark(isActive.heading({ level: 1 }))">
            mdi-format-header-1
          </v-icon>
        </button>
        <button @click="commands.heading({ level: 2 })">
          <v-icon :color="iconColorDark(isActive.heading({ level: 2 }))">
            mdi-format-header-2
          </v-icon>
        </button>
        <button @click="commands.heading({ level: 3 })">
          <v-icon :color="iconColorDark(isActive.heading({ level: 3 }))">
            mdi-format-header-3
          </v-icon>
        </button>
        <button @click="commands.bold">
          <v-icon :color="iconColorDark(isActive.bold())">
            mdi-format-bold
          </v-icon>
        </button>
        <button @click="commands.italic">
          <v-icon :color="iconColorDark(isActive.italic())">
            mdi-format-italic
          </v-icon>
        </button>
        <button @click="commands.underline">
          <v-icon :color="iconColorDark(isActive.underline())">
            mdi-format-underline
          </v-icon>
        </button>
        <button @click="commands.strike">
          <v-icon :color="iconColorDark(isActive.strike())">
            mdi-format-strikethrough
          </v-icon>
        </button>
        <button @click="commands.ordered_list">
          <v-icon :color="iconColorDark(isActive.ordered_list())">
            mdi-format-list-numbered
          </v-icon>
        </button>
        <button @click="commands.bullet_list">
          <v-icon :color="iconColorDark(isActive.bullet_list())">
            mdi-format-list-bulleted
          </v-icon>
        </button>
        <button @click="commands.code_block">
          <v-icon :color="iconColorDark(isActive.code_block())">
            mdi-xml
          </v-icon>
        </button>
        <button @click="commands.blockquote">
          <v-icon :color="iconColorDark(isActive.blockquote())">
            mdi-format-quote-close
          </v-icon>
        </button>
      </v-toolbar>
    </editor-menu-bubble>

    <editor-floating-menu
      v-if="floating"
      v-slot="{ commands, isActive, menu }"
      :editor="editor"
    >
      <div
        class="editor__floating-menu"
        :class="{ 'is-active': menu.isActive }"
        :style="`top: ${menu.top}px`"
      >
        <v-btn
          v-if="!expandFloatingToolbar && menu.isActive"
          color="indigo"
          fab
          outlined
          x-small
          class="xx-small"
          dark
          @click="expandFloatingToolbar = true"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <template v-if="expandFloatingToolbar">
          <v-btn
            color="indigo"
            fab
            x-small
            class="xx-small"
            dark
            @click="expandFloatingToolbar = false"
          >
            <v-icon>mdi-minus</v-icon>
          </v-btn>
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
            <v-icon
              class="small-medium"
              :color="iconColor(isActive.underline())"
            >
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
        </template>
      </div>
    </editor-floating-menu>

    <editor-menu-bar
      v-slot="{ commands, isActive, focused }"
      :editor="editor"
    >
      <div class="menubar top-toolbar" :class="{ 'is-focused': focused, 'is-hidden': hideToolbar }">
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
        dense: dense,
      }"
      :style="getStyle(maxHeight)"
      @keydown.shift.enter="submit"
    />
  </div>
</template>

<script>
import {
  Editor,
  EditorContent,
  EditorMenuBar,
  EditorMenuBubble,
  EditorFloatingMenu
} from "tiptap";
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
    EditorMenuBar,
    EditorMenuBubble,
    EditorFloatingMenu
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
      enter: false,
      expandFloatingToolbar: false,
      updateEventEnabled: true
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
  &__bubble-menu {
    position: absolute;
    display: flex;
    z-index: 20;
    transform: translateX(-50%);
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
