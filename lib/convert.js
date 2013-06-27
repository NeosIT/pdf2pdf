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

var fs = require('fs')

function pad(number, length) {

    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}


function check_files(basename, i, file_list, cb) {


    fs.exists(basename+'-'+pad(i,3)+'.pbm', function (res){
        if(res){
            file_list[i]=basename+'-'+pad(i,3)+'.pbm'
            check_files(basename, ++i, file_list, cb)
        }
        else {
            fs.exists(basename+'-'+pad(i,3)+'.ppm', function (res){
                if(res){
                    file_list[i]=basename+'-'+pad(i,3)+'.ppm'
                    check_files(basename, ++i, file_list, cb)
                }
                else {
                    cb(null)
                }
            })
        }
    })
}

function get_res (step, file_list, res_pdf, res_images, cb){
    require('child_process').spawn('gm',['identify', file_list[step]]).stdout.on('data', function (data){
        res_images[step] = [Math.round(72*data.toString().match(/\d+x\d+/g).toString().split('x')[0]/res_pdf[step].split('x')[0]), Math.round(72*data.toString().match(/\d+x\d+/g).toString().split('x')[1]/res_pdf[step].split('x')[1])]
    }).on('close', function (code, signal){
            if (step == file_list.length - 1)
                cb (null)
            else
                get_res(++step, file_list, res_pdf, res_images, cb)
        })
}


function convert(options, cb_status, callback) {

    var file_list = new Array()
    fs.mkdir (options.temp_path, 0700, function (err){
        if (err)
            callback(err)
        else{
            options.temp_path+='/temp-'
            require('child_process').spawn('pdfimages',[options.in_pdf, options.temp_path]).on('close', function (error){
                if (error)
                    callback(error)
                else{
                    if (cb_status('extracting images from PDF') == false){
                        callback(new Error('Process cancelled'))
                        return -1
                    }
                    check_files(options.temp_path, 0, file_list, function (err){
                        require('child_process').spawn('gm',['identify', options.in_pdf]).stdout.on('data', function (data){
                            var res_images = new Array()
                            get_res (0, file_list, data.toString().match(/\d+x\d+/g), res_images, function (err){
                                if (err)
                                    callback(err)
                                else
                                    callback(err, file_list, res_images)
                            })
                        }).on('error', function (code, signal){
                                console.log('error ' + code)
                                callback(code)
                            }).on('close', function (code, signal){
                                //console.log('code: ' + code + '\nsignal: ' + signal)
                            })
                    })
                }
            })
        }
    })
}

exports.convert = convert
