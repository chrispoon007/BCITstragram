const path = require("path");
/*
 * Project: Milestone 1
 * File Name: main.js
 * Description:
 *
 * Created Date: Feb 13th, 2024
 * Author: Chris Poon - Set C - A00720639
 *
 */

const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");

IOhandler.unzip(zipFilePath, pathUnzipped)
    .then(() => IOhandler.readDir(pathUnzipped))
    .then(files => Promise.all(files.map(file => IOhandler.grayScale(file, `${pathProcessed}/${path.basename(file, '.png')}_grayscaled.png`))))
    .catch(console.error);