import fs from "fs-extra";
import gm from "gm";
import { Log } from "meteor/logging";
import { Meteor } from "meteor/meteor";
import { promisify } from "util";

const existsAsync = promisify(fs.exists);
const statAsync = promisify(fs.stat);
const sizeAsync = promisify(gm.prototype.size);
const writeAsync = promisify(gm.prototype.write);

export const createThumbnails = async (collection, fileRef, cb) => {
  try {
    const exists = await existsAsync(fileRef.path);
    if (!exists) {
      throw new Meteor.Error(`File ${fileRef.path} not found in [createThumbnails] Method`);
    }

    const image = gm(fileRef.path);

    const features = await sizeAsync.call(image);
    await collection.collection.update(fileRef._id, {
      $set: {
        "meta.width": features.width,
        "meta.height": features.height,
        "versions.original.meta.width": features.width,
        "versions.original.meta.height": features.height
      }
    });

    const path = `${collection.storagePath(fileRef)}/thumbnail-${fileRef._id}.${fileRef.extension}`;
    const img = gm(fileRef.path)
      .quality(70)
      .define("filter:support=2")
      .define("jpeg:fancy-upsampling=false")
      .define("jpeg:fancy-upsampling=off")
      .define("png:compression-filter=5")
      .define("png:compression-level=9")
      .define("png:compression-strategy=1")
      .define("png:exclude-chunk=all")
      .autoOrient()
      .noProfile()
      .strip()
      .dither(false)
      .interlace("Line")
      .filter("Triangle")
      .resize(250)
      .interlace("Line");

    await writeAsync.call(img, path);

    const stat = await statAsync(path);
    const imgInfo = await sizeAsync.call(gm(path));

    fileRef.versions.thumbnail = {
      path,
      size: stat.size,
      type: fileRef.type,
      extension: fileRef.extension,
      meta: {
        width: imgInfo.width,
        height: imgInfo.height
      }
    };

    const upd = { $set: { "versions.thumbnail": fileRef.versions.thumbnail } };
    await collection.collection.updateAsync(fileRef._id, upd);

    // eslint-disable-next-line no-unused-expressions
    cb && cb(null, fileRef);
  } catch (error) {
    Log.error(error);
    // eslint-disable-next-line no-unused-expressions
    cb && cb(error);
  }
  return true;
};
