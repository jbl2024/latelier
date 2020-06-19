<template>
  <editor-floating-menu
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

        <button @click="commands.todo_list">
          <v-icon
            class="small-medium"
            :color="iconColor(isActive.todo_list())"
          >
            mdi-checkbox-marked
          </v-icon>
        </button>
      </template>
    </div>
  </editor-floating-menu>
</template>

<script>
import { EditorFloatingMenu } from "tiptap";

export default {
  components: {
    EditorFloatingMenu
  },
  props: {
    editor: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      expandFloatingToolbar: false
    };
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

.editor {
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

.small-medium {
  font-size: 18px !important;
}

</style>
