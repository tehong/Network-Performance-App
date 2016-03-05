/**
 * created by ehong 02/25/2016
 */
'use strict';

var COMMENT_BOX_HEIGHT = 317;
// This assumes there is a dataSource and listView from the caller
function findScrollItem(dataSource, entity) {
  if (!dataSource || !entity) {
    return;
  }
  for (var i=0; i<dataSource.getRowCount(); i++) {
    var data = dataSource.getRowData(0,i);
    var kpi = data.category.toLowerCase() + "_" + data.kpi.toLowerCase().replace(/ /g, "_");
    var entityName = entity.entityName;
    if (entity.siteName != "") entityName = entity.siteName;
    if (entity.sectorName != "") entityName = entity.sectorName;
    var name = data.name.toLowerCase().replace(/ /g, "_");
    if (data.areaName.toLowerCase() === entity.networkName && kpi === entity.kpi && name === entityName) {
      return data;
    }
  }
}

module.exports = findScrollItem;
