import { fabric } from "fabric";

const setText = function(group, label) {
  const text = new fabric.IText(label, {
    left: group.get("left"),
    top: group.get("top"),
    fontFamily: "Roboto"
  });
  text.enterEditing();
  return text;
};

export const MindmapNode = function(options) {
  options = options || {};
  const group = new fabric.Group([], options);
  group.addWithUpdate(setText(group, options.label));
  return group;
};
