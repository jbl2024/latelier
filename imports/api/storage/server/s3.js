import { Meteor } from "meteor/meteor";
import { _ } from "meteor/underscore";
import { Random } from "meteor/random";
import stream from "stream";
import S3 from "aws-sdk/clients/s3"; /* http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html */
import fs from "fs-extra";

const bound = Meteor.bindEnvironment((callback) => callback());

const s3Conf = Meteor.settings.storage?.s3 || {};
let s3;
if (s3Conf && s3Conf.key && s3Conf.secret && s3Conf.bucket && s3Conf.region) {
  s3 = new S3({
    secretAccessKey: s3Conf.secret,
    accessKeyId: s3Conf.key,
    region: s3Conf.region,
    endpoint: s3Conf.endpoint,
    s3ForcePathStyle: true,
    signatureVersion: "v4",
    httpOptions: {
      timeout: 6000,
      agent: false
    }
  });

  /* eslint: no-console: off */
  console.log("## storage: ready for s3");
}

const moveToS3 = ({ collection, folder, fileRef }) => {
  _.each(fileRef.versions, (vRef, version) => {
    const filePath = `${folder}/${Random.id()}-${version}.${fileRef.extension}`;
    s3.putObject(
      {
        // ServerSideEncryption: 'AES256', // Optional
        StorageClass: "STANDARD",
        Bucket: s3Conf.bucket,
        Key: filePath,
        Body: fs.createReadStream(vRef.path),
        ContentType: vRef.type
      },
      (error) => {
        bound(() => {
          if (error) {
            /* eslint no-console: off */
            console.error(error);
          } else {
            // Update FilesCollection with link to the file at AWS
            const upd = { $set: {} };
            upd.$set[`versions.${version}.meta.pipePath`] = filePath;

            collection.update(
              {
                _id: fileRef._id
              },
              upd,
              (updError) => {
                if (updError) {
                  console.error(updError);
                } else {
                  collection.unlink(collection.findOne(fileRef._id), version);
                }
              }
            );
          }
        });
      }
    );
  });
};

export const onAfterUpload = ({ collection, folder, fileRef }) => {
  if (!s3) {
    return;
  }
  moveToS3({ collection, folder, fileRef });
};

export const interceptDownload = ({ collection, http, fileRef, version }) => {
  let path;

  if (
    fileRef
    && fileRef.versions
    && fileRef.versions[version]
    && fileRef.versions[version].meta
    && fileRef.versions[version].meta.pipePath
  ) {
    path = fileRef.versions[version].meta.pipePath;
  }

  if (path) {
    // If file is successfully moved to AWS:S3
    // We will pipe request to AWS:S3
    // So, original link will stay always secure

    // To force ?play and ?download parameters
    // and to keep original file name, content-type,
    // content-disposition, chunked "streaming" and cache-control
    // we're using low-level .serve() method
    const opts = {
      Bucket: s3Conf.bucket,
      Key: path
    };

    if (http.request.headers.range) {
      const vRef = fileRef.versions[version];
      const range = _.clone(http.request.headers.range);
      const array = range.split(/bytes=([0-9]*)-([0-9]*)/);
      const start = parseInt(array[1], 10);
      let end = parseInt(array[2], 10);
      if (Number.isNaN(end)) {
        // Request data from AWS:S3 by small chunks
        end = start + this.chunkSize - 1;
        if (end >= vRef.size) {
          end = vRef.size - 1;
        }
      }
      opts.Range = `bytes=${start}-${end}`;
      http.request.headers.range = `bytes=${start}-${end}`;
    }

    const fileColl = collection;
    s3.getObject(opts, function(error) {
      if (error) {
        console.error(error);
        if (!http.response.finished) {
          http.response.end();
        }
      } else {
        if (
          http.request.headers.range
          && this.httpResponse.headers["content-range"]
        ) {
          // Set proper range header in according to what is returned from AWS:S3
          http.request.headers.range = this.httpResponse.headers[
            "content-range"
          ]
            .split("/")[0]
            .replace("bytes ", "bytes=");
        }

        const dataStream = new stream.PassThrough();
        fileColl.serve(
          http,
          fileRef,
          fileRef.versions[version],
          version,
          dataStream
        );
        dataStream.end(this.data.Body);
      }
    });

    return true;
  }
  // While file is not yet uploaded to AWS:S3
  // It will be served file from FS
  return false;
};


export const onBeforeRemove = ({ collection, search }) => {
  const cursor = collection.find(search);
  cursor.forEach((fileRef) => {
    _.each(fileRef.versions, (vRef) => {
      if (vRef && vRef.meta && vRef.meta.pipePath) {
        s3.deleteObject({
          Bucket: s3Conf.bucket,
          Key: vRef.meta.pipePath
        }, (error) => {
          bound(() => {
            if (error) {
              console.error(error);
            }
          });
        });
      }
    });
  });
};


export const migrateCollectionToS3 = ({ collection, folder, search = {} }) => {
  if (!folder) return;
  if (!collection) return;

  const cursor = collection.find(search);
  const isAlreadyMigrated = (vRef) => {
    if (vRef && vRef.meta && vRef.meta.pipePath) {
      return true;
    }
    return false;
  };

  cursor.forEach((fileRef) => {
    _.each(fileRef.versions, (vRef) => {
      if (isAlreadyMigrated(vRef)) return;


      if (!fs.existsSync(vRef.path)) {
        console.log(`${collection.collection._name}: file not found: ${vRef.path}`);
        return;
      }

      /* eslint no-console: off */
      console.log(`${collection.collection._name}: moving ${vRef.path} to s3 (folder: ${folder})`);

      moveToS3({ collection, folder, fileRef });
    });
  });
};
