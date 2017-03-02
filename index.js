#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var JSZip = require('jszip');
var program = require('commander');
var recursive = require('recursive-readdir');
var ProgressBar = require('progress');

program
    .arguments('<entries...>')
    // .option('-d, --directory', 'Input entry is a directory to compress')
    .option('-o, --output <output>', 'Output file')
    .option('-l, --level <compressLevel>', 'Compress level')
    // .option('-r, --regex <regex>', 'Regex')
    // .option('-u, --unzip', 'Unzip mode')
    .action(function(filesAndDirs, options) {
        const files = [];
        const dirs = [];
        let i = 0;
        filesAndDirs.forEach(f => fs.stat(f, (err, stats) => {
            if (!err) {
                if (stats.isFile()) {
                    files.push(f);
                } else {
                    dirs.push(f);
                }
            }
            if (++i === filesAndDirs.length) {
                const zip = new JSZip();
                const finalize = () => compress(zip, options.output || `${filesAndDirs[0]}.zip`, options.level);
                let j = 0;
                processFiles(zip, files, () => {if (++j === 2 ) finalize(); })
                processDirectories(zip, dirs, () => {if (++j === 2 ) finalize(); })
            }
        }));
    })
    .parse(process.argv);

function processFiles(zip, files, completeCallback) {
    readFiles(
        files,
        (fileInfo, data) => zip.file(fileInfo.base, data),
        () => completeCallback()
    );
}

function processDirectories(zip, dirs, completeCallback) {
    let i = 0;
    dirs.forEach(dir => {
        zip.folder(dir);
        recursive(dir, (errors, files) => {
            if (!errors) {
                readFiles(
                    files,
                    (fileInfo, data) => zip.folder(fileInfo.dir).file(fileInfo.base, data),
                    () => { if (++i === dirs.length) { completeCallback(); } }
                );
            } else {
                console.log("failed to read files", errors);
            }
        });
    });
}

function readFiles(files, fileCallback, completeCallback) {
    files.forEach((file, i) => {
        var fileInfo = path.parse(file);
        fs.readFile(file, (err, data) => {
            if (!err) {
                fileCallback(fileInfo, data);
                if (i === files.length - 1) {
                    completeCallback();
                }
            } else {
                console.log("filed to read file", err);
            }
        });
    });
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