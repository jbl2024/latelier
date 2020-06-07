export const colors = {
  getLabelColor(color) {
    if (this.isDark(color)) {
      return "#fff";
    }
    return "#222";
  },

  /**
   * #fa0 -> #ffaa00
   */
  fixHex(str) {
    if (str.length !== 4) {
      return str;
    }
    return `#${str[1]}${str[1]}${str[2]}${str[2]}${str[3]}${str[3]}`;
  },

  getBrightness(color) {
    color = `${color}`;
    const isHEXA = color.indexOf("#") === 0 && color.length > 7;
    const isHEX = color.indexOf("#") === 0 && !isHEXA;
    const isRGB = color.indexOf("rgb") === 0;
    let r;
    let g;
    let b;
    let alpha = 0;

    if (isHEXA) {
      const m = color.substr(1).match(/(\S{2})/g);
      if (m) {
        r = parseInt(m[0], 16);
        g = parseInt(m[1], 16);
        b = parseInt(m[2], 16);
        alpha = parseInt(m[3], 16);
      }

      // convert alpha from [0, 255] to [0..1] range
      alpha = (alpha * 100) / 255 / 100.0;

      // apply alpha to individual components
      r = (1 - alpha) * r + alpha * r;
      g = (1 - alpha) * g + alpha * g;
      b = (1 - alpha) * b + alpha * b;
    }

    if (isHEX) {
      color = this.fixHex(color);
      const m = color
        .substr(1)
        .match(color.length === 7 ? /(\S{2})/g : /(\S{1})/g);
      if (m) {
        r = parseInt(m[0], 16);
        g = parseInt(m[1], 16);
        b = parseInt(m[2], 16);
      }
    }
    if (isRGB) {
      const m = color.match(/(\d+){3}/g);
      if (m) {
        [r, g, b] = m;
      }
    }

    if (typeof r !== "undefined") return (r * 299 + g * 587 + b * 114) / 1000;

    return null;
  },

  isDark(color, threshold = 128) {
    return this.getBrightness(color) < threshold;
  },
  adjust(color, amount) {
    return `#${color.replace(/^#/, "").replace(/../g, (aColor) => (`0${Math.min(255, Math.max(0, parseInt(aColor, 16) + amount)).toString(16)}`).substr(-2))}`;
  }
};
