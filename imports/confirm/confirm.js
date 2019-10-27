import Confirm from "./Confirm.vue";

function Install(Vue, options = {}) {
  const property = options.property || "$confirm";
  delete options.property;
  const { vuetify } = options;
  delete options.vuetify;
  if (!vuetify) {
    /* eslint no-console: off */
    console.warn(
      "Module vuetify-confirm needs vuetify instance. Use Vue.use(VuetifyConfirm, { vuetify })"
    );
  }
  const Ctor = Vue.extend({ vuetify, ...Confirm });
  function createDialogCmp(aOptions) {
    const container = document.querySelector("[data-app=true]") || document.body;
    return new Promise((resolve) => {
      /* eslint prefer-object-spread: off */
      const cmp = new Ctor({
        propsData: Object.assign({}, Vue.prototype.$confirm.options, aOptions),
        destroyed: () => {
          container.removeChild(cmp.$el);
          resolve(cmp.value);
        }
      });
      container.appendChild(cmp.$mount().$el);
    });
  }

  function show(message, aOptions = {}) {
    options.message = message;
    return createDialogCmp(aOptions);
  }

  Vue.prototype[property] = show;
  Vue.prototype[property].options = options || {};
}

export default Install;
