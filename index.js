#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var JSZip = require('jszip');
var program = require('commander');

program
    .arguments('<file>')
    .option('-f, --file <file>', 'File to compress')
    .option('-d, --directory <directory>', 'Directory to compress')
    .option('-o, --output <output>', 'Output file')
    .option('-l, --level <compressLevel>', 'Compress level')
    .option('-u, --unzip', 'Unzip mode')
    .action(function(file) {
        var zip = new JSZip();
        var fileInfo = path.parse(file);
        fs.readFile(file, (err, data) => {
            if (!err) {
                zip.file(fileInfo.base, data);
                compress(zip, `${fileInfo.name}.zip`);
            }
        });
    })
    .parse(process.argv);

function addAssetsToZip(jszip, assets, regex) {
    const assetNames = Object.keys(assets).filter(x => !!regex ? regex.test(x) : true);
    assetNames.forEach(x => jszip.file(x, assets[x].source()));
}

function compress(jszip, outFile) {
    jszip.generateAsync(
        { type: "nodebuffer", compression: "DEFLATE", streamFiles: true, level: 6 },
        ({ currentFile, percent }) => logProgress(currentFile, percent)
    )
    .then(function(content) {
        // write file
        fs.writeFile(outFile, content, () => console.log("done"));
    })
    .catch((error) => {
        console.log("failed to create zip", error);
    });
}

function logProgress(file, progress) {
    if (!file) return;
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`${progress}% ${file}`);
}