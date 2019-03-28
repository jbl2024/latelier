
export const colors = {
  getLabelColor(color) {
    // see https://trendct.org/2016/01/22/how-to-choose-a-label-color-to-contrast-with-background/
    if (color.length < 5) {
      color += color.slice(1);
    }
    return (color.replace('#', '0x')) > (0xffffff / 2) ? '#333' : '#fff';
  }
}