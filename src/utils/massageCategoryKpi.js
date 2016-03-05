/**
 * Split the kpi into category and kpi fields using the first word of kpi field as the category
 *  created by EH on 02/13/16
 */
'use strict';

// Split the kpi into category and kpi fields using the first word of kpi field as the category
function massageCategoryKpi(kpiRecord) {
  if (!kpiRecord['category'] || kpiRecord["category"] === null) {
    var indexSpace = kpiRecord["kpi"].indexOf(" ");
    if (indexSpace >= 0) {
      kpiRecord["category"] = kpiRecord["kpi"].substring(0, indexSpace);
      kpiRecord["kpi"] = kpiRecord["kpi"].substring(indexSpace+1, kpiRecord["kpi"].length);
    }
    // FIXME:  remove this when the Data Availability formula is fixed in the backend!
    // kpiRecord = fixDataAvailabiity(kpiRecord);
  }
  return kpiRecord;
}
// Temporarary fix of the Data Availability formula problem
function fixDataAvailabiity(kpiRecord) {
  if (kpiRecord["kpi"].indexOf("Availability") > -1) {
    kpiRecord["dailyAverage"] = 100.0 - parseFloat(kpiRecord["dailyAverage"]);
    if (kpiRecord["data"]) {
      for (var i=0; i<kpiRecord["data"].length; i++) {
        var trueHourlyData= 100 - kpiRecord["data"][i][1];  // fix the value
        if (trueHourlyData < 0.0) {
          trueHourlyData = 0.0
        }
        kpiRecord["data"][i][1] = trueHourlyData;
      }
    }
  }
  return kpiRecord;
}

module.exports = massageCategoryKpi;
