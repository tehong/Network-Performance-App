/**
 * created by ehong 12/05/2015
 */
'use strict';

var getThresholdSign = require('./getThresholdSign');
function addUtilData(entity: Array<any>): Array<any> {
  for (var i=0; i < entity.length; i++) {
      // reset the isCommentOn flag
      entity[i].isCommentOn = false;
      if (!entity[i].thresholds.redSign || !entity[i].thresholds.greenSign) {
        entity[i].thresholds.redSign = getThresholdSign(entity[i].thresholds, "red");
        entity[i].thresholds.greenSign = getThresholdSign(entity[i].thresholds, "green");
      }
  }
  return entity;
}

module.exports = addUtilData;
