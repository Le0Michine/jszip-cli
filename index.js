#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var JSZip = require('jszip');
var program = require('commander');
var recursive = require('recursive-readdir');
var ProgressBar = require('progress');

program
    .arguments('<file>')
    .option('-f, --file <file>', 'File to compress')
    .option('-d, --directory', 'Input entry is a directory to compress')
    .option('-o, --output <output>', 'Output file')
    .option('-l, --level <compressLevel>', 'Compress level')
    // .option('-r, --regex <regex>', 'Regex')
    // .option('-u, --unzip', 'Unzip mode')
    .action(function(file, options) {
        var zip = new JSZip();
        if (options.directory) {
            var outputFileName = options.output || file;
            zip.folder(file);
            recursive(file, (errors, files) => {
                if (!errors) {
                    var filesCount = files.length;
                    files.filter(file => options.regex ? !!file.match(options.regex) : true).forEach((file, i) => {
                        var fileInfo = path.parse(file);
                        fs.readFile(file, (err, data) => {
                            if (!err) {
                                zip.folder(fileInfo.dir).file(fileInfo.base, data);
                                if (i === filesCount - 1) {
                                    compress(zip, options.output || `${file}.zip`, options.level);
                                }
                            } else {
                                console.log("filed to read file", err);
                            }
                        });
                    });
                } else {
                    console.log("failed to read files", errors);
                }
            });
        } else {
            var fileInfo = path.parse(file);
            fs.readFile(file, (err, data) => {
                if (!err) {
                    zip.file(fileInfo.base, data);
                    compress(zip, options.output || `${fileInfo.base}.zip`, options.level);
                }
            });
        }
    })
    .parse(process.argv);

function addAssetsToZip(jszip, assets, regex) {
    const assetNames = Object.keys(assets).filter(x => !!regex ? regex.test(x) : true);
    assetNames.forEach(x => jszip.file(x, assets[x].source()));
}

function compress(jszip, outFile, level) {
    var bar = createProgressBar();
    var lastPercent = 0;
    jszip.generateAsync(
        { type: "nodebuffer", compression: "DEFLATE", streamFiles: true, level: level || 6 },
        ({ currentFile, percent }) => { 
            var diff = Math.floor(percent) - Math.floor(lastPercent);
            if (diff) {
                bar.tick(diff);
                lastPercent = Math.floor(percent);
            }
        }
    )
    .then(function(content) {
        fs.writeFile(outFile, content, () => console.log("  done"));
    })
    .catch((error) => {
        console.log("failed to create zip", error);
    });
}

function createProgressBar() {
    var bar = new ProgressBar('  compressing [:bar] :percent :elapseds', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: 100
    });
    return bar;
}

function logProgress(file, progress) {
    if (!file) return;
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`${progress}% ${file}`);
}