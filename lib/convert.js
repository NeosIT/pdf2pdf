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

function convert(options, cb_status, callback) {

    //  options.gm_bin, options.in_pdf, options.temp_path
    require('growing-file').open(options.in_pdf).on('end', function(err) {
        console.log('finished')
        var gm_options = options.gm_options || '-density 300 -depth 8'
        var out_tiff = [options.temp_path, '/tiff-', crypto.randomBytes(6).readUInt32LE(0), '.tiff'].join('') //generate random filename
        if (cb_status)
            cb_status('converting PDF to TIFF');
        exec([options.gm_bin, 'convert', gm_options, options.in_pdf, out_tiff].join(' '), function (error, stdout, stderr) { //convert PDF to multi page tiff
            if (error)
                callback(error)

            else
                callback(null, out_tiff)
        })

    });

}

exports.convert = convert