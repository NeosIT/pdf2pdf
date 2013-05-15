/**
 * Created with JetBrains WebStorm.
 * User: thomas
 * Date: 13.05.13
 * Time: 13:30
 * To change this template use File | Settings | File Templates.

 main export of module
 pdf2pdf takes and checks options passed
 */

function pdf2pdf(options, callback) {

    var parser = require('./parser.js')
    var ocr = require('./ocr.js')
    var convert = require('./convert')
    var fs = require('fs')

    if (!options.infile) //check for file to process
        throw ('no input file specified!')
    else
        var infile = options.infile

    if (!options.outfile) //check for output filename
        throw ('no output file specified!')
    else
        var outfile = options.outfile

    var gm_options = options.gm_options || '-density 300 -depth 8'
    var tmpdir = options.tmp || process.env.TMPDIR || process.env.TMP || process.env.TEMP || '/tmp' //check for temporary directory; attempt to detect from environment if not passed; default to '/tmp' if detection fails
    var tesseract = options.tess_bin || 'tesseract' //check for tesseract-ocr binary, default to 'tesseract' if not passed
    var gm_bin = options.gm_bin || 'gm' //check for GraphicsMagic binary, default to 'gm' if not passed

    convert.convert({gm_bin: gm_bin, in_pdf: infile, temp_path: tmpdir, gm_options: gm_options}, options.cb_status, function (error, tiff_file) { //run pdf to tiff conversion
        if (error) {
            console.error(error)
            callback(error)
        }
        else {
            ocr.run_ocr(tesseract, tiff_file, tmpdir, options.cb_status, function (error, hocr_html) { //run tesseract
                if (error) {
                    console.error(error)
                    callback(error)
                }
                else {
                    parser.generatePDF(tiff_file, hocr_html, tmpdir, outfile, options.cb_status, function (error) { //parse tesseract output and generate searchable PDF
                        if (error) {
                            console.error(error)
                            callback(error)
                        }
                        else {
                            fs.unlink(tiff_file)
                            callback(null)
                        }
                    })
                }
            })
        }
    })
}

exports.run = pdf2pdf