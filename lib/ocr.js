/**
 * Created with JetBrains WebStorm.
 * User: thomas
 * Date: 13.05.13
 * Time: 10:33
 * To change this template use File | Settings | File Templates.

 run_ocr runs tesseract-ocr on a tiff file and generates annotated HTML with a randomly generated filename
 options:
 tess_path:  path to the tesseract-ocr executable
 infile:     tiff file to process
 temp_path:  temporary directory to store the generated HTML file in
 callback:   callback funtion to execute after processing
 */

var exec = require('child_process').exec
var crypto = require('crypto')

function run_ocr(tess_path, infile, temp_path, callback) {
    var outbase = [temp_path, '/ocr-', crypto.randomBytes(6).readUInt32LE(0)].join('') //generate random filename
    exec([tess_path, infile, outbase, '-l deu hocr'].join(' '), function (error, stdout, stderr) { //run OCR
        if (error) {
            callback(error)
            return 1
        }
        else {
            callback(null, [outbase, '.html'].join(''))
            return 0
        }
    })//.stderr.on('data', function(data){console.log(data);})
}

exports.run_ocr = run_ocr