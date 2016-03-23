/**
 *  sort by color then sort by "Category" + "Data" string within a color
 *
 */
'use strict';

var getThreshold = require('./getThreshold');
var getDailyAverage = require('./getDailyAverage');
var isDataEmpty = require('./isDataEmpty');
var massageCategoryKpi = require('../utils/massageCategoryKpi');
var addUtilData = require('./addUtilData');


function getSortedDataArray(dataArray: Array<any>): Array<any> {
  // first check if the arrays are there
  if (dataArray.constructor !== Array) {
    // if dataArrays are not there, return an empty array;
    return [];
  }
  var newDataArray = addUtilData(dataArray);

  // if only on element, sort is not call, still need to massage the category and kpi fields.
  if (newDataArray.length === 1) {
    newDataArray[0] = massageCategoryKpi(newDataArray[0]);
    return newDataArray;
  }
  newDataArray.sort(
    function(a,b) {
      // first separate the category and the kpi field
      a = massageCategoryKpi(a);
      b = massageCategoryKpi(b);
      // red = -11, yellow = 0, green = 1 , we need to to put red in lower place i.e. smaller at the front of the array
      if (a["data"] && b["data"]) {  // first check if data arrays are there
        var aEmpty = isDataEmpty(a["data"]);
        var bEmpty = isDataEmpty(b["data"]);
        // could be that the data is not there so put that in the back
        if (aEmpty) {
          if (bEmpty) {
            return 0;
          } else {
            return 1;
          }
        }
        if (bEmpty) {
          if (aEmpty) {
            return 0;
          } else {
            return -1;
          }
        }
      }
      // start the real sorting
      var kpi = a["kpi"];
      // temp. fix the category of the zone and sector service API results
      if (a["geoEntity"] !== "area") {
        if (kpi.indexOf("Downlink") !== -1) {
          a["category"] = "Downlink";
        }
        if (kpi.indexOf("Uplink") !== -1) {
          a["category"] = "Uplink";
        }
        kpi = kpi.replace("Data ", "");
        kpi = kpi.replace("Downlink ", "");
        kpi = kpi.replace("Uplink ", "");
      }
      // get the relevant thresholds and dailyAverage
      var a_redThreshold = getThreshold(a["thresholds"], "red", kpi);
      var a_greenThreshold = getThreshold(a["thresholds"], "green", kpi);
      var a_dailyAverage = getDailyAverage(kpi, a["dailyAverage"], a["kpiDecimalPrecision"]);

      // modify the threhsold to remove the signs
      a["thresholds"]['red'] = a_redThreshold;
      a["thresholds"]['green'] = a_greenThreshold;
      a["dailyAverage"] = a_dailyAverage;
      a["kpi"] = kpi;

      kpi = b["kpi"];
      // temp. fix the category of the zone and sector service API results
      if (b["geoEntity"] !== "area") {
        if (kpi.indexOf("Downlink") !== -1) {
          b["category"] = "Downlink";
        }
        if (kpi.indexOf("Uplink") !== -1) {
          b["category"] = "Uplink";
        }
        kpi = kpi.replace("Data ", "");
        kpi = kpi.replace("Downlink ", "");
        kpi = kpi.replace("Uplink ", "");
      }

      // get the relevant thresholds and dailyAverage
      var b_redThreshold = getThreshold(b["thresholds"], "red", kpi);
      var b_greenThreshold = getThreshold(b["thresholds"], "green", kpi);
      var b_dailyAverage = getDailyAverage(kpi, b["dailyAverage"], b["kpiDecimalPrecision"]);
      // modify the threhsold to the correct one
      b["thresholds"]['red'] = b_redThreshold;
      b["thresholds"]['green'] = b_greenThreshold;
      b["dailyAverage"] = b_dailyAverage;
      b["kpi"] = kpi;

      // if (a["name"].indexOf("Akron") > -1 && b["name"].indexOf("Watertown") > -1) debugger;
      // based on dailyAverage and the sorting direction, return the right value
      var result = 0;
      if (a_redThreshold < a_greenThreshold) {
        result = a_dailyAverage - b_dailyAverage;
      } else {
        result = b_dailyAverage - a_dailyAverage;
      }
      if (result === 0) {
        return a["name"] - b['name'];
      }
      return result;
    },
  )
  return newDataArray;
}

module.exports = getSortedDataArray;
