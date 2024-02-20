/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date: Feb 13th, 2024
 * Author: Chris Poon - Set C - A00720639
 *
 */

const yauzl = require('yauzl-promise'),
    fs = require('fs'),
    {pipeline} = require('stream/promises'),
    path = require('path');
const { PNG } = require ('pngjs/browser');

const unzip = async (pathIn, pathOut) => {
    const zip = await yauzl.open(pathIn);
    try {
        for await (const entry of zip) {
            if (entry.filename.includes('/')) {
                continue;
            }
            const readStream = await entry.openReadStream();
            const writeStream = fs.createWriteStream(
              `${pathOut}/${entry.filename}`
            );
            await pipeline(readStream, writeStream);
        }
    } finally {
        await zip.close();
        console.log("Extraction operation complete");
    }
    return pathOut;
};

const readDir = (dir) => {
  return new Promise((resolve, reject) => {
      fs.readdir(dir, (err, files) => {
          if (err) {
              reject(err);
          } else {
              let pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');
              resolve(pngFiles.map(file => path.join(dir, file)));
          }
      });
  });
};

const grayScale = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(pathIn);
    readStream
      .on('error', reject)
      .pipe(
        new PNG({
          filterType: 4,
        })
      )
      .on("parsed", function () {
        for (var y = 0; y < this.height; y++) {
          for (var x = 0; x < this.width; x++) {
            var idx = (this.width * y + x) << 2;

            var avg = (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3;

            this.data[idx] = avg;
            this.data[idx + 1] = avg;
            this.data[idx + 2] = avg;
          }
        }

        this.pack().pipe(fs.createWriteStream(`${pathOut}`))
          .on('finish', resolve)
          .on('error', reject);
      });
  });
};

// BONUS: Using this site for sepia algorithm: https://leware.net/photo/blogSepia.html
const sepiaFilter = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(pathIn);
    readStream
      .on('error', reject)
      .pipe(
        new PNG({
          filterType: 4,
        })
      )
      .on("parsed", function () {
        for (var y = 0; y < this.height; y++) {
          for (var x = 0; x < this.width; x++) {
            var idx = (this.width * y + x) << 2;

            var r = this.data[idx];
            var g = this.data[idx + 1];
            var b = this.data[idx + 2];

            this.data[idx] = Math.min(255, (0.393 * r) + (0.769 * g) + (0.189 * b));
            this.data[idx + 1] = Math.min(255, (0.349 * r) + (0.686 * g) + (0.168 * b));
            this.data[idx + 2] = Math.min(255, (0.272 * r) + (0.534 * g) + (0.131 * b));
          }
        }

        this.pack().pipe(fs.createWriteStream(`${pathOut}`))
          .on('finish', resolve)
          .on('error', reject);
      });
  });
};

module.exports = {
  unzip,
  readDir,
  grayScale,
  sepiaFilter,
};