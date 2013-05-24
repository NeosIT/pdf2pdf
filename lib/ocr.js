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

function ocr(tess_path, infiles, outfiles, i, cb_status, cb){
    if (i == infiles.length)
        cb(null)
    else {
        cb_status('OCRing page ' + (i+1) + ' of ' + infiles.length)
        require('child_process').spawn(tess_path, [infiles[i], infiles[i], '-l deu', 'hocr']).on('close', function (error){
            if (error)
                cb(error)
            else {
                outfiles[i] = infiles[i]+'.html'
                ocr(tess_path, infiles, outfiles, ++i, cb_status, cb)
            }
        })
    }
}


function run_ocr(tess_path, infiles, temp_path, cb_status, callback) {
    var file_list = new Array()
    ocr(tess_path, infiles, file_list, 0, cb_status, function(err){
        callback(err, file_list, infiles)
    })
}



exports.run_ocr = run_ocr