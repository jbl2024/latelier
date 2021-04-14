/* eslint class-methods-use-this: "off" */
/* eslint max-classes-per-file: "off" */
import { markInputRule, markPasteRule } from "tiptap-commands";
import { Italic, Bold } from "tiptap-extensions";

export const CustomItalic = class CustomItalic extends Italic {
  inputRules({ type }) {
    return [markInputRule(/(?:^| )[^\w\s_]*(_([^_]+)_)/g, type), markInputRule(/(?:^| )[^\w\s*]*(\*([^*]+)\*)/g, type)];
  }

  pasteRules({ type }) {
    return [markPasteRule(/(?:^| )[^\w\s_]*(_([^_]+)_)/g, type), markPasteRule(/(?:^| )[^\w\s*]*(\*([^*]+)\*)/g, type)];
  }
};

export const CustomBold = class CustomBold extends Bold {
  inputRules({ type }) {
    return [markInputRule(/(?:^|)(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, type)];
  }

  pasteRules({ type }) {
    return [markPasteRule(/(?:^|)(?:\*\*|__)([^*_]+)(?:\*\*|__)/g, type)];
  }
};
