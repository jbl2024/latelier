import { Meteor } from "meteor/meteor";

import fs from "fs-extra";
import gm from "gm";

const bound = Meteor.bindEnvironment((callback) => callback());

export const createThumbnails = (collection, fileRef, cb) => {
  fs.exists(fileRef.path, (exists) => {
    bound(() => {
      if (!exists) {
        throw Meteor.log.error(
          `File ${fileRef.path} not found in [createThumbnails] Method`
        );
      }

      const image = gm(fileRef.path);

      image.size((error, features) => {
        bound(() => {
          if (error) {
            /* eslint no-unused-expressions:off */
            /* eslint no-console:off */
            console.error("[_app.createThumbnails] [_.each sizes]", error);
            cb && cb(Meteor.Error("[_app.createThumbnails] [image.size]", error));
            return;
          }

          // Update meta data if original image
          collection.collection.update(fileRef._id, {
            $set: {
              "meta.width": features.width,
              "meta.height": features.height,
              "versions.original.meta.width": features.width,
              "versions.original.meta.height": features.height
            }
          });

          const path = `${collection.storagePath(fileRef)}/thumbnail-${
            fileRef._id
          }.${fileRef.extension}`;
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
            .filter("Triangle");

          // Change width and height proportionally
          img
            .resize(250)
            .interlace("Line")
            .write(path, (resizeError) => {
              bound(() => {
                if (resizeError) {
                  console.error("[createThumbnails] [img.resize]", resizeError);
                  cb && cb(resizeError);
                  return;
                }

                fs.stat(path, (fsStatError, stat) => {
                  bound(() => {
                    if (fsStatError) {
                      console.error(
                        "[_app.createThumbnails] [img.resize] [fs.stat]",
                        fsStatError
                      );
                      cb && cb(fsStatError);
                      return;
                    }

                    gm(path).size((gmSizeError, imgInfo) => {
                      bound(() => {
                        if (gmSizeError) {
                          console.error(
                            "[_app.createThumbnails] [_.each sizes] [img.resize] [fs.stat] [gm(path).size]",
                            gmSizeError
                          );
                          cb && cb(gmSizeError);
                          return;
                        }

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

                        const upd = { $set: {} };
                        upd.$set["versions.thumbnail"] = fileRef.versions.thumbnail;

                        collection.collection.update(
                          fileRef._id,
                          upd,
                          (colUpdError) => {
                            if (cb) {
                              if (colUpdError) {
                                cb(colUpdError);
                              } else {
                                cb(0, fileRef);
                              }
                            }
                          }
                        );
                      });
                    });
                  });
                });
              });
            });
        });
      });
    });
  });
  return true;
};
