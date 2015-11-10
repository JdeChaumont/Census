var system = fs = require('fs');

function convertStringToObjectArray(text){

    console.log("convertStringToObjectArray called")

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
    //console.log(resultArray[0]);

    return resultArray;
}

if (typeof module !== 'undefined') module.exports = { 'convert' : convertStringToObjectArray };
