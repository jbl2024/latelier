<template>
  <editor-menu-bubble
    v-slot="{ commands, isActive, menu, getMarkAttrs }"
    keep-in-bounds
    :editor="editor"
    @hide="hideLinkMenu"
  >
    <v-toolbar
      dark
      dense
      floating
      class="editor__bubble-menu"
      :class="{ 'is-active': menu.isActive }"
      :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
    >
      <v-dialog v-model="linkDialog" max-width="290">
        <v-card>
          <v-card-text>
            <v-text-field
              ref="linkInput"
              v-model="linkUrl"
              hide-details
              placeholder="https://"
              single-line
              @keydown.enter="setLinkUrl(commands.link, linkUrl)"
              @keydown.esc="setLinkUrl(commands.link, linkUrl)"
            />
            <v-card-actions>
              <v-btn text @click="setLinkUrl(commands.link, linkUrl)">
                <v-icon>
                  mdi-link
                </v-icon>
              </v-btn>
              <v-spacer />
              <v-btn text @click="setLinkUrl(commands.link, null)">
                <v-icon>
                  mdi-delete
                </v-icon>
              </v-btn>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-btn icon @click="commands.heading({ level: 1 })">
        <v-icon :color="iconColorDark(isActive.heading({ level: 1 }))">
          mdi-format-header-1
        </v-icon>
      </v-btn>
      <v-btn icon @click="commands.heading({ level: 2 })">
        <v-icon :color="iconColorDark(isActive.heading({ level: 2 }))">
          mdi-format-header-2
        </v-icon>
      </v-btn>
      <v-btn icon @click="commands.heading({ level: 3 })">
        <v-icon :color="iconColorDark(isActive.heading({ level: 3 }))">
          mdi-format-header-3
        </v-icon>
      </v-btn>
      <v-btn icon @click="commands.bold">
        <v-icon :color="iconColorDark(isActive.bold())">
          mdi-format-bold
        </v-icon>
      </v-btn>
      <v-btn icon @click="commands.italic">
        <v-icon :color="iconColorDark(isActive.italic())">
          mdi-format-italic
        </v-icon>
      </v-btn>
      <v-btn icon @click="commands.underline">
        <v-icon :color="iconColorDark(isActive.underline())">
          mdi-format-underline
        </v-icon>
      </v-btn>
      <v-btn icon @click="commands.strike">
        <v-icon :color="iconColorDark(isActive.strike())">
          mdi-format-strikethrough
        </v-icon>
      </v-btn>
      <v-btn icon @click="commands.ordered_list">
        <v-icon :color="iconColorDark(isActive.ordered_list())">
          mdi-format-list-numbered
        </v-icon>
      </v-btn>
      <v-btn icon @click="commands.bullet_list">
        <v-icon :color="iconColorDark(isActive.bullet_list())">
          mdi-format-list-bulleted
        </v-icon>
      </v-btn>
      <v-btn icon @click="commands.code_block">
        <v-icon :color="iconColorDark(isActive.code_block())">
          mdi-xml
        </v-icon>
      </v-btn>
      <v-btn icon @click="commands.blockquote">
        <v-icon :color="iconColorDark(isActive.blockquote())">
          mdi-format-quote-close
        </v-icon>
      </v-btn>

      <v-btn
        icon
        class="menububble__button"
        @click="showLinkMenu(getMarkAttrs('link'))"
      >
        <v-icon :color="isActive.link() ? 'blue' : 'white'">
          mdi-link
        </v-icon>
      </v-btn>

      <v-btn icon @click="commands.todo_list">
        <v-icon :color="iconColorDark(isActive.todo_list())">
          mdi-checkbox-marked
        </v-icon>
      </v-btn>
    </v-toolbar>
  </editor-menu-bubble>
</template>

<script>
import { EditorMenuBubble } from "tiptap";

export default {
  components: {
    EditorMenuBubble
  },
  props: {
    editor: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      linkUrl: null,
      linkDialog: false
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
    },
    showLinkMenu(attrs) {
      this.linkUrl = attrs.href;
      this.$nextTick(() => {
        this.linkDialog = true;
      });
    },
    hideLinkMenu() {},
    setLinkUrl(command, url) {
      this.linkDialog = false;
      command({ href: url });
    }
  }
};
</script>

<style lang="scss" scoped>
.editor {
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
    &__form {
      display: flex;
      align-items: center;
    }

    &__input {
      font: inherit;
      border: none;
      background: transparent;
      color: white;
    }
  }
}
</style>
