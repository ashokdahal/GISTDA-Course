// Display The AOI To add AOI to your project: download AOI from https://zenodo.org/records/12751419/files/AOI_prichit.zip?download=1 and then upload it in GEE
Map.addLayer(aoi, {color: 'FF0000'}, 'colored');



var TAGEE = require('users/zecojls/TAGEE:TAGEE-functions');


var startdate=ee.Date('2021-09-25');
var enddate=ee.Date('2021-10-25');

// // ************** Prepare Elevation Data ****************//
var dataset = ee.Image('USGS/SRTMGL1_003').clip(aoi);
var elevation = dataset.select('elevation').float();
var slope = ee.Terrain.slope(elevation).float();

var DEMAttributes = TAGEE.terrainAnalysis(TAGEE, dataset, aoi);
var HorizontalCurv=DEMAttributes.select('HorizontalCurvature').float();
var VerticalCurv=DEMAttributes.select('VerticalCurvature').float();
var northness = DEMAttributes.select('Northness').float();
var eastness = DEMAttributes.select('Eastness').float();

// // ************** Prepare Geological Data ****************//
var sand=ee.Image('projects/soilgrids-isric/sand_mean').select('sand_100-200cm_mean').clip(aoi).float();
var silt=ee.Image('projects/soilgrids-isric/silt_mean').select('silt_100-200cm_mean').clip(aoi).float();
var clay=ee.Image('projects/soilgrids-isric/clay_mean').select('clay_100-200cm_mean').clip(aoi).float();
var bulkdensity=ee.Image('projects/soilgrids-isric/bdod_mean').select('bdod_100-200cm_mean').clip(aoi).float();


// // ************** Prepare Rainfall Data *****************//
var Chrips = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY').filterBounds(aoi).filterDate(startdate,enddate).max().clip(aoi).float();

// // ****************** Prepare NDVI Data ****************** //

var ndvi = ee.ImageCollection("LANDSAT/LC08/C01/T1_32DAY_NDVI").select('NDVI').filterBounds(aoi).filterDate(startdate,enddate).max().clip(aoi).float();

// ****************** Combine them all in a single collection ******************

var factors = ee.ImageCollection.fromImages([elevation,slope,HorizontalCurv,VerticalCurv,northness,eastness,sand,silt,clay,bulkdensity,Chrips,ndvi
]); 


// ****************** Convert to 12 Band Image ******************
var factorsBands = factors.toBands();

// ****************** Export as GeoTIFF ******************

Export.image.toDrive({
  image: factorsBands,
  description: 'Factors',
  region: aoi,
  scale: 30,
  crs: 'EPSG:4326'
});
