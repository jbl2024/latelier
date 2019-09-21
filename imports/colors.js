
export const colors = {
  getLabelColor(color) {
    if (this.isDark(color)) {
      return '#fff';
    } else {
      return '#222';
    }
  },

  /**
   * #fa0 -> #ffaa00
   */
  fixHex(str) {
    if (str.length != 4) {
      return str;
    }
    return `#${str[1]}${str[1]}${str[2]}${str[2]}${str[3]}${str[3]}`;
  },
  
  getBrightness (color) {
    color = "" + color;
    const isHEX = color.indexOf("#") == 0;
    const isRGB = color.indexOf("rgb") == 0;
    if (isHEX) {
      color = this.fixHex(color);
      console.log(color)
      let m = color.substr(1).match(color.length == 7 ? /(\S{2})/g : /(\S{1})/g);
      if (m) var r = parseInt(m[0], 16), g = parseInt(m[1], 16), b = parseInt(m[2], 16);
    }
    if (isRGB) {
      let m = color.match(/(\d+){3}/g);
      if (m) var r = m[0], g = m[1], b = m[2];
    }
    if (typeof r != "undefined") return ((r*299)+(g*587)+(b*114))/1000;
  },  

  isDark(color) {
    // see https://trendct.org/2016/01/22/how-to-choose-a-label-color-to-contrast-with-background/
    return this.getBrightness(color) < 128;
  }
}