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
    <rich-editor-menu-bubble v-if="bubble" :editor="editor" />
    <rich-editor-floating-menu v-if="floating" menu :editor="editor" />
    <rich-editor-menu-bar
      v-if="!hideToolbar"
      :editor="editor"
      class="menu-bar"
    />
    <editor-content
      :editor="editor"
      :class="{
        editor: true,
        dense: dense,
      }"
      :style="getStyle(maxHeight)"
    />
  </div>
</template>

<script>
import { Coeditions } from "/imports/api/coeditions/coeditions";

import { Editor, EditorContent } from "tiptap";
import KeyboardSubmit from "./extensions/KeyboardSubmit";
import TodoItem from "./extensions/TodoItem";
import { CustomItalic, CustomBold } from "./extensions/Markdown";

import {
  Link,
  HardBreak,
  Blockquote,
  CodeBlock,
  Heading,
  OrderedList,
  BulletList,
  ListItem,
  Code,
  Strike,
  Underline,
  History,
  TodoList,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  Collaboration
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
    bubble: {
      type: Boolean,
      default: false
    },
    maxHeight: {
      type: String,
      default: null
    },
    editable: {
      type: Boolean,
      default: true
    },
    collaboration: {
      type: String,
      default: null
    },
    permissionObject: {
      type: String,
      default: null
    },
    permissionId: {
      type: String,
      default: null
    }
  },
  meteor: {
    coedition() {
      if (!this.collaboration) {
        return null;
      }
      const coedition = Coeditions.findOne({ objectId: this.collaboration });
      if (coedition && coedition.steps && coedition.version !== this.version) {
        this.version = coedition.version;
        const data = {
          version: coedition.version,
          steps: JSON.parse(coedition.steps)
        };
        this.editor.extensions.options.collaboration.update(data);
      }
      return coedition;
    }
  },
  data() {
    return {
      editor: null,
      content: this.value,
      ctrl: false,
      enter: false,
      version: null
    };
  },
  computed: {
    name() {
      return this.data;
    }
  },
  watch: {
    value() {
      if (this.collaboration) {
        return;
      }

      const existingContent = this.editor.getHTML();
      if (existingContent !== this.value) {
        this.editor.setContent(this.value);
      }
    },
    editable() {
      this.editor.setOptions({
        editable: this.editable
      });
    }
  },
  mounted() {
    const extensions = [
      new Link(),
      new HardBreak(),
      new Blockquote(),
      new CodeBlock(),
      new Heading({ levels: [1, 2, 3] }),
      new BulletList(),
      new OrderedList(),
      new ListItem(),
      new CustomBold(),
      new Code(),
      new CustomItalic(),
      new Strike(),
      new Underline(),
      new History(),
      new TodoItem({
        nested: true
      }),
      new TodoList(),
      new Table({
        resizable: true
      }),
      new TableHeader(),
      new TableCell(),
      new TableRow(),
      new KeyboardSubmit({
        context: this
      })
    ];

    if (this.collaboration) {
      Meteor.call(
        "coeditions.init",
        {
          objectId: this.collaboration,
          permissionObject: this.permissionObject,
          permissionId: this.permissionId
        },
        (error, result) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.version = result.version;
          extensions.push(
            new Collaboration({
              // the initial version we start with
              // version is an integer which is incremented with every change
              version: this.version,
              // debounce changes so we can save some requests
              debounce: 250,
              // onSendable is called whenever there are changed we have to send to our server
              onSendable: ({ sendable }) => {
                this.onSendable(sendable);
              }
            })
          );

          this.editor = new Editor({
            editable: this.editable,
            content: JSON.parse(result.doc),
            extensions: extensions,
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
          if (this.value) {
            const existingContent = this.editor.getHTML();
            if (existingContent !== this.value) {
              this.editor.setContent(this.value);
            }
          }
          this.$subscribe(
            "coeditions",
            this.collaboration,
            this.permissionObject,
            this.permissionId
          );

          if (this.autofocus) {
            this.$nextTick(() => {
              this.focus();
            });
          }
        }
      );
    } else {
      this.editor = new Editor({
        editable: this.editable,
        content: this.content,
        extensions: extensions,
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
    },

    onSendable(sendable) {
      Meteor.call(
        "coeditions.send",
        {
          objectId: this.collaboration,
          permissionObject: this.permissionObject,
          permissionId: this.permissionId,
          sendable: sendable,
          schema: {
            topNode: this.editor.options.topNode,
            nodes: this.editor.nodes,
            marks: this.editor.marks
          }
        },
        (error) => {
          if (error) {
            this.$notifyError(error);
          }
        }
      );
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

.menu-bar {
  border-bottom: 1px solid #ccc;
  padding: 8px;
  margin-bottom: 0.5rem;
  transition: visibility 0.2s 0.4s, opacity 0.2s 0.4s;
}
</style>

<style lang="scss">
.ProseMirror-focused {
  outline: none;
}

ul[data-type="todo_list"] {
  padding-left: 0;
}
li[data-type="todo_item"] {
  display: flex;
  flex-direction: row;
}
.todo-checkbox {
  border: 2px solid black;
  height: 0.9em;
  width: 0.9em;
  box-sizing: border-box;
  margin-right: 10px;
  margin-top: 0.3rem;
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer;
  border-radius: 0.2em;
  background-color: transparent;
  transition: 0.4s background;
}
.todo-content {
  flex: 1;
  > p:last-of-type {
    margin-bottom: 0;
  }
  > ul[data-type="todo_list"] {
    margin: 0.5rem 0;
  }
}
li[data-done="true"] {
  > .todo-content {
    > p {
      text-decoration: none;
    }
  }
  > .todo-checkbox {
    background-color: black;
  }
}
li[data-done="false"] {
  text-decoration: none;
}

.editor {
  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    margin: 0;
    overflow: hidden;

    td,
    th {
      min-width: 1em;
      border: 2px solid #ddd;
      padding: 3px 5px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;
      > * {
        margin-bottom: 0;
      }
    }

    th {
      font-weight: bold;
      text-align: left;
    }

    .selectedCell:after {
      z-index: 2;
      position: absolute;
      content: "";
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(200, 200, 255, 0.4);
      pointer-events: none;
    }

    .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: 0;
      width: 4px;
      z-index: 20;
      background-color: #adf;
      pointer-events: none;
    }
  }

  .tableWrapper {
    margin: 1em 0;
    overflow-x: auto;
  }

  .resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
  }
}
</style>
