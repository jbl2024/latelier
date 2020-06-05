import VueI18n from "vue-i18n";
import Vue from "vue";
import messages from "/imports/i18n/i18n";

let { language } = navigator;
if (language.startsWith("en-")) {
  language = "en";
}

Vue.use(VueI18n);

export default new VueI18n({
  locale: language,
  fallbackLocale: "fr",
  silentTranslationWarn: true,
  messages
});
