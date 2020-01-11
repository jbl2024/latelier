import { fabric } from "fabric";

export const MindmapNode = function(canvas, label, options) {
  options = options || {};
  let items;

  // Double-click event handler
  const onDoubleClick = function(obj, handler) {
    return function() {
      if (obj.clicked) handler(obj);
      else {
        obj.clicked = true;
        setTimeout(function() {
          obj.clicked = false;
        }, 500);
      }
    };
  };

  // ungroup objects in group
  const ungroup = function(group) {
    items = group._objects;
    group._restoreObjectsState();
    canvas.remove(group);
    canvas.renderAll();
    for (let i = 0; i < items.length; i++) {
      canvas.add(items[i]);
    }
    // if you have disabled render on addition
    canvas.renderAll();
  };

  // Re-group when text editing finishes
  const dimensionText = new fabric.IText("Dimension Text", {
    fontFamily: "Comic Sans",
    fontSize: 14,
    stroke: "#000",
    strokeWidth: 1,
    fill: "#000",
    left: 170,
    top: 60
  });
  dimensionText.on("editing:exited", function() {
    for (let i = 0; i < items.length; i++) {
      canvas.remove(items[i]);
    }
    const grp = new fabric.Group(items, {});
    canvas.add(grp);
    grp.on(
      "mousedown",
      onDoubleClick(grp, function(obj) {
        ungroup(grp);
        canvas.setActiveObject(dimensionText);
        dimensionText.enterEditing();
        dimensionText.selectAll();
      })
    );
  });

  function addRuler() {
    const dimensionMark = new fabric.Path(
      "M0,0L0,-5L0,5L0,0L150,0L150,-5L150,5L150,0z"
    );
    dimensionMark.set({
      left: 150,
      top: 70,
      stroke: "#333333",
      strokeWidth: 2,
      scaleY: 1
    });
    const dimensionGroup = new fabric.Group([dimensionMark, dimensionText], {
      left: 50,
      top: 50
    });
    canvas.add(dimensionGroup);
    dimensionGroup.on(
      "mousedown",
      onDoubleClick(dimensionGroup, function(obj) {
        ungroup(dimensionGroup);
        canvas.setActiveObject(dimensionText);
        dimensionText.enterEditing();
        dimensionText.selectAll();
        canvas.renderAll();
      })
    );
    return dimensionGroup;
  }

  return addRuler();
  // const text = new fabric.IText(label, options);
  // // text.enterEditing();
  // return text;
};
