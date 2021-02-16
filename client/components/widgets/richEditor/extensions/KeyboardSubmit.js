import { Extension } from "tiptap";

export default class RichEditorKeyboardSubmit extends Extension {
  keys() {
    return {
      "Ctrl-Enter": () => {
        this.options.context.submit();
      }
    };
  }
}
