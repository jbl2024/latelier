<template>
  <editor-menu-bar v-slot="{ commands, isActive, focused }" :editor="editor">
    <div class="menubar top-toolbar" :class="{ 'is-focused': focused }">
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
        <v-icon class="small-medium" :color="iconColor(isActive.bullet_list())">
          mdi-format-list-bulleted
        </v-icon>
      </button>
      <button @click="commands.code_block">
        <v-icon class="small-medium" :color="iconColor(isActive.code_block())">
          mdi-xml
        </v-icon>
      </button>
      <button @click="commands.blockquote">
        <v-icon class="small-medium" :color="iconColor(isActive.blockquote())">
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
      <button @click="commands.todo_list">
        <v-icon class="small-medium" :color="iconColor(isActive.todo_list())">
          mdi-checkbox-marked
        </v-icon>
      </button>
      <button
        @click="
          commands.createTable({
            rowsCount: 2,
            colsCount: 2,
            withHeaderRow: false,
          })
        "
      >
        <v-icon class="small-medium">
          mdi-table
        </v-icon>
      </button>

      <span v-if="isActive.table()">
        <button @click="commands.deleteTable">
          <v-icon class="small-medium">
            mdi-table-remove
          </v-icon>
        </button>
        <button @click="commands.addColumnBefore">
          <v-icon class="small-medium">
            mdi-table-column-plus-before
          </v-icon>
        </button>
        <button @click="commands.addColumnAfter">
          <v-icon class="small-medium">
            mdi-table-column-plus-after
          </v-icon>
        </button>
        <button @click="commands.deleteColumn">
          <v-icon class="small-medium">
            mdi-table-column-remove
          </v-icon>
        </button>
        <button @click="commands.addRowBefore">
          <v-icon class="small-medium">
            mdi-table-row-plus-before
          </v-icon>
        </button>
        <button @click="commands.addRowAfter">
          <v-icon class="small-medium">
            mdi-table-row-plus-after
          </v-icon>
        </button>
        <button @click="commands.deleteRow">
          <v-icon class="small-medium">
            mdi-table-row-plus-remove
          </v-icon>
        </button>
        <button @click="commands.toggleCellMerge">
          <v-icon class="small-medium">
            mdi-table-merge-cells
          </v-icon>
        </button>
      </span>
    </div>
  </editor-menu-bar>
</template>

<script>
import { EditorMenuBar } from "tiptap";

export default {
  components: {
    EditorMenuBar
  },
  props: {
    editor: {
      type: Object,
      default: null
    }
  },
  data() {
    return {};
  },

  methods: {
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
    }
  }
};
</script>

<style lang="scss" scoped>
.menubar {
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

.small-medium {
  font-size: 18px !important;
}
</style>
