var system = fs = require('fs');
var readFile = require('./lib/convertFeatureCollectionToObjectArray');
var utils = require('./lib/utils');
var rtree = require('./lib/rbush'); // R-tree

var path  = "/users/j/sites/PPR/", ext = ".txt";
var currentPeriod = "20151017";

/******************************************************************************************/
/* Helper functions ***************************************************************************/
/******************************************************************************************/
String.prototype.trim = function() { return this.replace(/^\s+|\s+$/, ''); };

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};
/******************************************************************************************/
/* Section 1 - Read files in *********************************************************************/
/******************************************************************************************/
var maps = {};
var mapFiles= ["Cities_Towns", "Settlements", "Small_Areas"];
mapFiles.forEach(function(e,i,a){
    maps[e] = readFile.convert(fs.readFileSync(path+"maps/"+e+".geojson").toString(),true); //console.log(src[e][10]);
});
var properties = readFile.convert(fs.readFileSync(path+"data/src/downloads/merged"+currentPeriod+ext).toString()); //console.log(src[e][10]);

/*var readStream = fs.createReadStream('myfile.txt');
var hash = crypto.createHash('sha1');
readStream
  .on('data', function (chunk) {
    hash.update(chunk);
  })
  .on('end', function () {
    console.log(hash.digest('hex'));
});*/

var counties = {
    Donegal: { code: [ '33' ], centroid: [ -7.904483036486015, 54.92402831135034 ], province: 'Ulster' },
    Monaghan: { code: [ '34' ], centroid: [ -6.923966635844729, 54.155491660292995 ], province: 'Ulster' },
    Carlow: { code: [ '01' ],  centroid: [ -6.823285842760665, 52.729618270108524 ], province: 'Leinster' },
    Dublin: { code: [ '02', '03', '04', '05' ], centroid: [ -6.2585800803326395, 53.358994354834465 ], province: 'Leinster' },
    Kildare: { code: [ '06' ], centroid: [ -6.818637982956581, 53.19114217083964 ], province: 'Leinster' },
    Kilkenny: { code: [ '07' ], centroid: [ -7.233757353428097, 52.574857543702315 ], province: 'Leinster' },
    Laois: { code: [ '08' ], centroid: [ -7.356106579100897, 52.983832930773296 ], province: 'Leinster' },
    Longford: { code: [ '09' ], centroid: [ -7.725173755268245, 53.71273089919337 ], province: 'Leinster' },
    Louth: { code: [ '10' ], centroid: [ -6.414197914595129, 53.90995003026851 ], province: 'Leinster' },
    Meath: { code: [ '11' ], centroid: [ -6.732304036973397, 53.631936887607615 ], province: 'Leinster' },
    Offaly: { code: [ '12' ], centroid: [ -7.60004432523031, 53.20819352200994 ], province: 'Leinster' },
    Westmeath: { code: [ '13' ], centroid: [ -7.443194905927221, 53.528767689038204 ], province: 'Leinster' },
    Wexford: { code: [ '14' ], centroid: [ -6.571339321495413, 52.4605584498885 ], province: 'Leinster' },
    Wicklow: { code: [ '15' ], centroid: [ -6.372645117221746, 52.97920622884855 ], province: 'Leinster' },
    Clare: { code: [ '16' ], centroid: [ -9.042714615914111, 52.84084846310728 ], province: 'Munster' },
    Cork: { code: [ '17', '18' ], centroid: [ -8.836231398804909, 51.91852356455203 ], province: 'Munster' },
    Kerry: { code: [ '19' ], centroid: [ -9.721772945230498, 52.12067578082145 ], province: 'Munster' },
    Limerick: { code: [ '20', '21' ], centroid: [ -8.75110915312186, 52.4941134265422 ], province: 'Munster' },
    Tipperary: { code: [ '22', '23' ], centroid: [ -7.96215967207024, 52.6521625995809 ], province: 'Munster' },
    Waterford: { code: [ '24', '25' ], centroid: [ -7.60824500816328, 52.1718626233007 ], province: 'Munster' },
    Galway: { code: [ '26', '27' ], centroid: [ -8.950899173843425, 53.36425889272161 ], province: 'Connacht' },
    Leitrim: { code: [ '28' ], centroid: [ -8.023564083659306, 54.14092908076034 ], province: 'Connacht' },
    Mayo: { code: [ '29' ], centroid: [ -9.385081767113327, 53.92541946907294 ], province: 'Connacht' },
    Roscommon: { code: [ '30' ], centroid: [ -8.246970524307166, 53.724820866607 ], province: 'Connacht' },
    Sligo: { code: [ '31' ], centroid: [ -8.623620645213858, 54.15782953701542 ], province: 'Connacht' },
    Cavan: { code: [ '32' ], centroid: [ -7.35321100799088, 53.995211401963786 ], province: 'Ulster' } };

/******************************************************************************************/
/* Section 2 - Create indexed regions R-tree ********************************************************/
/******************************************************************************************/
var trees = {};

mapFiles.forEach(function(e,i,a){
    trees[e] = createTree(e);
});

//console.log(trees);

function createTree(map){
    var res = rtree.rbush(9); // this may not be optimal
    var bBoxArray = maps[map].map(function(e,i,a){
        return bBoxForFeature(e,i);
    });
    return  res.load(bBoxArray);
}

function bBoxForFeature(region,index){
    var res;
    res = polyFromFeature(region).reduce(function(r,e,i,a){
        Array.prototype.push.apply(r,bBox(e)); //merge arrays
        return r;
    },[]);
    res["region"]= index; //console.log(res);
    return res;
}

function bBox(pts){
    var x = [], y = [];
    pts.forEach(function(e,i,a){
        y.push(e[1]); x.push(e[0]); // Lng is X, Lat is Y - due to order in Feature Geometry
    });
    return [x.min(),y.min(),x.max(),y.max()];
}


/******************************************************************************************/
/* Section 3 - Match properties to regions ********************************************************/
/******************************************************************************************/
var summary = { "found": 0, "notFound": 0, "default" : 0 };
summary["All"] = { "found": { "2010":0,"2011":0,"2012":0,"2013":0,"2014":0,"2015":0 }
        , "notFound": { "2010":0,"2011":0,"2012":0,"2013":0,"2014":0,"2015":0 }
        , "default": { "2010":0,"2011":0,"2012":0,"2013":0,"2014":0,"2015":0 } };

regions = ["City", "Set", "SA"];
mapName = ["NAME", "SETTL_NAME", "SMALL_AREA"];
//properties.slice(0,10000).forEach(function(e,i,a){
properties.forEach(function(e,i,a){
    var item = e['Location']; if(item==null){ return; }
    var found = false;
    if(!summary[item["Cty"]]){
        summary[item["Cty"]] = { "found": { "2010":0,"2011":0,"2012":0,"2013":0,"2014":0,"2015":0 }
            , "notFound": { "2010":0,"2011":0,"2012":0,"2013":0,"2014":0,"2015":0 }
            , "default": { "2010":0,"2011":0,"2012":0,"2013":0,"2014":0,"2015":0 } };
    }
    var pt = item['Geo'];
    var y = pt['Lat'], x = pt['Lng']; //console.log([x,y,x,y]);
    if(!pointValid([x,y])){
        pt['source'] = 'defaulted';
        pt['Lng'] = counties[item['Cty']]['centroid'][0];
        pt['Lat'] = counties[item['Cty']]['centroid'][1];
        updateSummary("default",e["Date"].substr(0,4),item["Cty"]);
        return; // exit
    }
    Object.keys(trees).forEach(function(f,j,b){ //console.log(f);
        var result = trees[f].search([x,y,x,y]); //console.log(result);
        item[regions[j]] = "N/A";
        result.forEach(function(g,k,c){
            var region = maps[f][g['region']];
            if(isPointInPolys(polyFromFeature(region),[x,y])){ // poly
                var prop = region['properties']; //console.log("Point in Region"); console.log(region['properties']);
                item[regions[j]] = prop[mapName[j]];
                if(f=="Small_Areas"){  // Special case for Small Areas
                    found = true;
                    updateSummary("found",e["Date"].substr(0,4),item["Cty"]);
                    item['SA'] = prop['SMALL_AREA'].substr(0,6)+'/'+ prop['SMALL_AREA'].split('/').map(function(e,i,a){ return parseInt(e.substr(e.length-3,3)) }).join('/');
                    item['ED']=prop['EDNAME'];
                    item['Admin_Cty']=prop['COUNTY'];
                    item['Admin_Cty_Name']=prop['COUNTYNAME'];
                    item['Prov']=counties[item['Cty']]['province']||'Error';
                }
            }
        });
    });
    if(found==false){
        updateSummary("notFound",e["Date"].substr(0,4),item["Cty"]);
    }
    item['class'] = "N/A"
    if(item['City']!="N/A"){
        item['class'] = "urban";
    } else if(item['City']=="N/A"&&item['Set']!="N/A"){
        item['class'] = "suburban";
    } else if(item['Set']=="N/A"&&item['SA']!="N/A"){
        item['class'] = "rural";
    }
    //console.log(e);
    if(i%10e3==0) { console.log(i+" records processed");}
});

console.log(summary);
console.log(properties[160000]);

function updateSummary(type,date,county){
    summary[type]++;
    summary["All"][type][date]++;
    summary[county][type][date]++;
}

// returns array of polygons
function polyFromFeature(region){ //console.log(region);
    var res,poly,n,m=[];
    poly = region["geometry"]["coordinates"];
    n = poly.length;
    if(region.geometry.type==='Polygon'){
        n=1;
    }
    for(var i=0;i<n;i++){
        var p = poly[i];
        if(n===1){
            res=[p];
        }
        if(n>1){
            for(var j=0;j<p.length;j++){
                m.push(p[j]);
            }
            res=m;
        }
    } //console.log(res);
    return res;
}

function pointValid(pt){ //console.log("Check in Ireland")
    var N = 55.436211, S = 51.424511, W = -5.997500, E = -10.618340;
    var Irl= [[W,N],[E,N],[E,S],[W,S],[W,N]];
    return isPointInPoly(Irl,pt);
}
/******************************************************************************************/
/* Section 4 - Save merged file  *****************************************************************/
/******************************************************************************************/
function saveFile(name,collection){
    var wstream = fs.createWriteStream(name);
    collection.forEach(function(e,i,a){
        //saveFile(path+"merged"+currentPeriod+ext,JSON.stringify(e)+"\n");
        wstream.write(JSON.stringify(e)+"\n");
        if(i%10e3==0) { console.log(i+" records saved");}
    })
    wstream.end();
}

saveFile(path+"mergedRegions"+currentPeriod+ext,properties.filter(function(e,i,a){ return e['Location']!=null; }));


/******************************************************************************************/
/* Helper functions  ***************************************************************************/
/******************************************************************************************/
function isPointInPolys(polys, pt){
    for(var i=0, a=polys,e;i<a.length;i++){ e=a[i];
        if(isPointInPoly(e,pt)==true){
            return true;
        }
    }
    return false;
}

function isPointInPoly(poly, pt){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) || (poly[j][1] <= pt[1] && pt[1] < poly[i][1]))
        && (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
        && (c = !c); //console.log(pt + " in poly " + c)
    return c;
}
