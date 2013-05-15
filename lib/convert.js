/**
 * Created with JetBrains WebStorm.
 * User: thomas
 * Date: 13.05.13
 * Time: 11:46
 * To change this template use File | Settings | File Templates.

 convert() creates a 300dpi tiff file from a pdf and passes the randomly generated filename to the callback
 options:
 im_convert: path to the ImageMagick convert executable
 in_pdf:     path to the PDF to be converted
 temp_path:  path to the temporary directory to store the generated file
 callback:   callback function to be executed after the conversion
 */

var gm = require('gm')
var exec = require('child_process').exec
var crypto = require('crypto')

function convert(gm_bin, in_pdf, temp_path, callback) {

    var out_tiff = [temp_path, '/tiff-', crypto.randomBytes(6).readUInt32LE(0), '.tiff'].join('') //generate random filename

    exec([gm_bin, ' convert -density 300 -depth 8', in_pdf, out_tiff].join(' '), function (error, stdout, stderr) { //convert PDF to multi page tiff
        if (error) {
            callback(error)
            return 1
        }
        else {
            callback(null, out_tiff)
            return 0
        }
    })
}

exports.convert = convert