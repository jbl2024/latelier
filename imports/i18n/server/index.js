import messages from "/imports/i18n/i18n";

function dotGet(obj, dotKey, defaultValue = null) {
  const keys = dotKey.split(".");
  let val = obj;
  while (keys.length > 0) {
    const currentKey = keys.shift();
    if (val[currentKey]) {
      val = val[currentKey];
    } else {
      val = defaultValue;
      break;
    }
  }
  return val;
}

function isString(x) {
  return Object.prototype.toString.call(x) === "[object String]";
}

export default function i18n(locale = "en", fallbackLocale = "en") {
  let msgs = messages[locale] ? messages[locale] : messages[fallbackLocale];
  if (!msgs) {
    msgs = {};
  }
  return {
    t(langKey, datas = {}) {
      const str = dotGet(msgs, langKey, "");
      const datasKeys = Object.keys(datas);
      if (!datasKeys.length || !isString(str)) return str;
      /* eslint no-useless-escape:off */
      const regexPattern = `\{{${datasKeys.join("\}}|\{{")}\}}`;
      const regex = new RegExp(regexPattern, "ig");
      return str.replace(regex, function (matched) {
        return datas[matched.replace("{{", "").replace("}}", "")];
      });
    }
  };
}
