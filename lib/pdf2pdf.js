/**
 * Created with JetBrains WebStorm.
 * User: thomas
 * Date: 13.05.13
 * Time: 13:30
 * To change this template use File | Settings | File Templates.

 main export of module
 pdf2pdf takes and checks options passed
 */

function rmrf (path) {
    var fs = require('fs')
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};


function pdf2pdf(options, callback) {

    var parser = require('./parser.js')
    var ocr = require('./ocr.js')
    var convert = require('./convert')
    var fs = require('fs')
    var crypto = require('crypto')



    if (!options.infile) //check for file to process
        throw ('no input file specified!')
    else
        var infile = options.infile

    if (!options.outfile) //check for output filename
        throw ('no output file specified!')
    else
        var outfile = options.outfile

    var tmpdir = (options.tmp || process.env.TMPDIR || process.env.TMP || process.env.TEMP || '/tmp') + '/EnrichPDF-' + crypto.randomBytes(6).readUInt32LE(0) //check for temporary directory; attempt to detect from environment if not passed; default to '/tmp' if detection fails
    var tesseract = options.tess_bin || 'tesseract' //check for tesseract-ocr binary, default to 'tesseract' if not passed
    var gm_bin = options.gm_bin || 'gm' //check for GraphicsMagic binary, default to 'gm' if not passed


    convert.convert({gm_bin: gm_bin, in_pdf: infile, temp_path: tmpdir}, options.cb_status, function (error, file_list, res_images) { //run pdf to tiff conversion
        if (error){
            rmrf(tmpdir)
            callback(error)
        }
        else {
            //rmrf(tmpdir)
            //return 0
            ocr.run_ocr(tesseract, file_list, options.cb_status, function (error, hocr_html, tmp_img) { //run tesseract
                if (error){
                    rmrf(tmpdir)
                    callback(error)
                }
                else {
                    parser.generatePDF(tmp_img, hocr_html, tmpdir, options.outfile, res_images, options.cb_status, function (error) { //parse tesseract output and generate searchable PDF
                        if (error){
                            rmrf(tmpdir)
                            callback(error)
                        }
                        else {
                            //cleanup
                            rmrf(tmpdir)
                            callback(null)
                        }
                    })
                }
            })
        }
    })
}

exports.run = pdf2pdf