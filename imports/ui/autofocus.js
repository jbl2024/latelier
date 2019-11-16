export const autofocus = {
  focus(el) {
    const element = el.$el || el;
    const input = element.querySelector(
      "input:not([type=hidden]),textarea:not([type=hidden])"
    );
    if (input) {
      setTimeout(() => {
        input.focus();
      }, 0);
    }
  }
};
