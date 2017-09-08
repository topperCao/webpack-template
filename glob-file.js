var path = require("path");
var glob = require('glob');

var srcDir = path.resolve(process.cwd(), 'src');
var entries = function () {
    var jsDir = path.resolve(srcDir, 'js');
    console.log(jsDir);
    var entryFiles = glob.sync(jsDir + '/**/*.{js,jsx}', {ignore: jsDir + '/lib/**/*.js'});
    var map = {};

    for (var i = 0; i < entryFiles.length; i++) {
        var filePath = entryFiles[i];
        var filename = filePath.substring(filePath.indexOf('js/') + 3, filePath.lastIndexOf('.'));
        map[filename] = filePath;
    }
    console.log(map);
    return map;
}
entries()