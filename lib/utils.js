// Function to compare two objects
function objectDifferences() {
  var leftChain, rightChain, diffs=[], result;

  function compare2Objects (x, y, key) {
    var p;

    // remember that NaN === NaN returns false
    // and isNaN(undefined) returns true
    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
         return true;
    }

    // Compare primitives and functions.
    // Check if both arguments link to the same object.
    // Especially useful on step when comparing prototypes
    if (x === y) {
        return true;
    }

    // Works in case when functions are created in constructor.
    // Comparing dates is a common scenario. Another built-ins?
    // We can even handle functions passed across iframes
    if ((typeof x === 'function' && typeof y === 'function') ||
       (x instanceof Date && y instanceof Date) ||
       (x instanceof RegExp && y instanceof RegExp) ||
       (x instanceof String && y instanceof String) ||
       (x instanceof Number && y instanceof Number)) {
       if(x.toString() === y.toString()){
        return true;
       }
       diffs.push({ "key" : key, "error" : "not equal", "x" : x, "y" : y });
    }

    // At last checking prototypes as good a we can
    if (!(x instanceof Object && y instanceof Object)) {
        diffs.push({ "key" : key, "error" : "prototypes different", "x" : x, "y" : y });
    }

    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
        diffs.push({ "key" : key, "error" : "sub-class", "x" : x, "y" : y });
    }

    if (x.constructor !== y.constructor) {
        diffs.push({ "key" : key, "error" : "constructor not equal", "x" : x, "y" : y });
    }

    if (x.prototype !== y.prototype) {
        diffs.push({ "key" : key, "error" : "prototype not equal", "x" : x, "y" : y });
    }

    // check for infinitive linking loops
    if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
         diffs.push({ "key" : key, "error" : "cycling", "x" : x, "y" : y });
    }

    // Quick checking of one object beeing a subset of another.
    // todo: cache the structure of arguments[0] for performance
    for (p in y) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            diffs.push({ "key" : p, "error" : "property missing", "x" : x[p], "y" : y[p] });
        }
        else if (typeof y[p] !== typeof x[p]) {
            diffs.push({ "key" : p, "error" : "typeof different", "x" : x[p], "y" : y[p] });
        }
    }

    for (p in x) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            diffs.push({ "key" : p, "error" : "property missing", "x" : x[p], "y" : y[p] });
        }
        else if (typeof y[p] !== typeof x[p]) {
            diffs.push({ "key" : p, "error" : "typeof different", "x" : x[p], "y" : y[p] });
        } else if(typeof(x[p])==='object' || typeof(x[p])==='function'){

                leftChain.push(x);
                rightChain.push(y);

                result = compare2Objects(x[p], y[p], p);
                if(result!==true){
                    diffs.push(result);
                }

                leftChain.pop();
                rightChain.pop();
        } else {
            if (x[p] !== y[p]) {
                return { "key" : p, "error" : "not equal", "x" : x[p], "y" : y[p] };
            }
        }
    }

    return true;
  }

  if (arguments.length < 1) {
    return true; //Die silently? Don't know how to handle such case, please help...
    // throw "Need two or more arguments to compare";
  }

  for (var i = 1, l = arguments.length; i < l; i++) {

      leftChain = []; //todo: this can be cached
      rightChain = [];

      result = compare2Objects(arguments[0], arguments[i],"root");
      if(result!==true){
        diffs.push(result);
      }
      return diffs;
  }

  return true;
}

var getEditDistance = function(a, b){
  if(a.length == 0) return b.length;
  if(b.length == 0) return a.length;

  var matrix = [];

  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b.charAt(i-1) == a.charAt(j-1)){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
};

var fuzzyMatch = function(s,t){
    if (!s.length) return 0;
    if (!t.length) return 0;
    if (s===t) return 1;
    return (1 - getEditDistance(s,t) / Math.max(s.length,t.length));
}

if (typeof module !== 'undefined') {
    module.exports = {
        'objectDifferences' : objectDifferences,
        'fuzzyMatch' : fuzzyMatch
    };
}
