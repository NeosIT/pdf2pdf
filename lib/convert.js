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
var spawn = require('child_process').spawn
var crypto = require('crypto')
var file_list = new Array()
var fs = require('fs')

function pad(number, length) {

    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}


function check_files(basename, i, cb) {
    fs.exists(basename+'-'+pad(i,3)+'.pbm', function (res){
        if(res){
            file_list[i]=basename+'-'+pad(i,3)+'.pbm'
            check_files(basename, ++i, cb)
        }
        else {
            fs.exists(basename+'-'+pad(i,3)+'.ppm', function (res){
                if(res){
                    file_list[i]=basename+'-'+pad(i,3)+'.ppm'
                    check_files(basename, ++i, cb)
                }
                else {
                    cb(null)
                }
            })
        }
    })
}


function convert(options, cb_status, callback) {

    var tmp_path = options.temp_path + '/EnrichPDF-' + crypto.randomBytes(6).readUInt32LE(0)
    spawn('pdfimages',[options.in_pdf, tmp_path]).on('close', function (error){
        if (error)
            callback(error)
        else{
            cb_status('extracting images from PDF')
            check_files(tmp_path, 0, function (err){
                callback(err, file_list)
            })
        }
    })

}

exports.convert = convert
