/**
 * Created with JetBrains WebStorm.
 * User: thomas
 * Date: 13.05.13
 * Time: 13:30
 * To change this template use File | Settings | File Templates.

 main export of module
 pdf2pdf takes and checks options passed
 */

function pdf2pdf(options) {

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

    var tmpdir = options.tmp || process.env.TMPDIR || process.env.TMP || process.env.TEMP || '/tmp' //check for temporary directory; attempt to detect from environment if not passed; default to '/tmp' if detection fails
    var tesseract = options.tess_bin || 'tesseract' //check for tesseract-ocr binary, default to 'tesseract' if not passed
    var gm_bin = options.gm_bin || 'gm' //check for GraphicsMagic binary, default to 'gm' if not passed

    convert.convert(gm_bin, infile, tmpdir, function (error, tiff_file) { //run pdf to tiff conversion
        if (error) {
            console.error(error)
            return 1
        }
        else {
            ocr.run_ocr(tesseract, tiff_file, tmpdir, function (error, hocr_html) { //run tesseract
                if (error) {
                    console.error(error)
                    return 1
                }
                else {
                    parser.generatePDF(tiff_file, hocr_html, tmpdir, outfile, function (error) { //parse tesseract output and generate searchable PDF
                        if (error) {
                            console.error(error)
                            return 1
                        }
                        else {
                            fs.unlink(tiff_file)
                            return 0
                        }
                    })
                }
            })
        }
    })
}

exports.run = pdf2pdf