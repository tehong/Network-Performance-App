/**
 * created by ehong 12/05/2015
 */
'use strict';

function isDataEmpty(dataArray: Array<any>): boolean {
  for (var i=0; i < dataArray.length; i++) {
      // if data found => return false
      if (dataArray[i].length === 2) {
        return false;
      }
  }
  return true;
}

module.exports = isDataEmpty;
