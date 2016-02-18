/**
 *  Get alphbetically sorted data array
 */
'use strict';

var getThreshold = require('./getThreshold');
var getDailyAverage = require('./getDailyAverage');
var isDataEmpty = require('./isDataEmpty');

function getKpiSortedDataArray(dataArray: Array<any>): Array<any> {
  dataArray.sort(
    function(a,b) {
      // sorted alphbetically
      var aKpiString = a["category"] + " " + a["kpi"];
      var bKpiString = b["category"] + " " + b["kpi"];
      if(aKpiString < bKpiString) return 1;
      if(aKpiString > bKpiString) return -1;
      return 0;
    },
  )
  return dataArray;
}

module.exports = getKpiSortedDataArray;
