var system = fs = require('fs');

String.prototype.trim = function() { return this.replace(/^\s+|\s+$/, ''); };

function processFiles(fileName,callback){
    var resultArray = [];
    fs.exists(fileName, function(exists) {
      if (exists) {
        fs.stat(fileName, function(error, stats) {
          fs.open(fileName, "r", function(error, fd) {
            var fileSize = stats.size;
            console.log("File Size " + fileSize);
            var bufferSize = stats.size;
            var buffer = new Buffer(bufferSize); //Reading in the entire file

            fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
                var data = buffer.toString("utf8", 0, buffer.length);
                resultArray = convertStringToObjectArray(data);
                callback(resultArray);
            });
            fs.close(fd); console.log(fileName + " closed");
          });
        });
      }
    });
}

function convertStringToObjectArray(text){

    var objStr = '', objCh ='', startObj = endObj = 0, objCounter = 0;
    var data = text, resultArray = [];

    for (var i = 0; i < text.length; i++) {

        objCh = data.charAt(i);
        objStr += objCh;
        if(objCh==='{') {
            startObj++;
            if (startObj===1)
                objStr = objCh;
        }
        if(objCh==='}')
            endObj++;

        if(startObj>0 && startObj===endObj) {
            objCounter++;
            try {
                var objJson = JSON.parse(objStr);
                var output = "";
                resultArray.push(objJson);
            }
            catch(err) {
                console.log("Parsing Error");
            }
            output = "";
            objStr = "";
            startObj = 0;
            endObj = 0;
        }
    }
    console.log("Array Length " + resultArray.length);
    console.log(resultArray[0]);

    return resultArray;
}

if (typeof module !== 'undefined') module.exports = { 'processFiles' : processFiles, 'convert' : convertStringToObjectArray };
