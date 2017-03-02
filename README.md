# jszip-cli

A npm interface for JSZip library https://stuk.github.io/jszip.

Installation

```
npm install jszip-cli
```

Usage:
```
jszip [options] <entries>
```
Options:

```
<entries>                    One or more files or directories, should be space separated
-h, --help                   Output usage information
-c, --config                 Entry is a config file
-o, --output <output>        Output file
-l, --level <compressLevel>  Compress level
```

Example of config file jszip.json:

```
{
    "entities": [
        { "name": "./some-directory", "deflate": true },
        "another-directory",
        "file"
    ],
    "options": {
        "output": "out.zip"
    }
}
```

Getting support

Please, if you have a problem with the library, first make sure you read this README. If you read this far, thanks, you're good. Then, please make sure your problem really is with jszip-cli. It is? Okay, then I'll look at it. Send me a mail and we can talk. Please don't open issues, as I don't think that is the proper forum for support problems. Some problems might as well really be bugs in jszip-cli, if so I'll let you know to open an issue instead :)

But if you know you really found a bug, feel free to open an issue instead.