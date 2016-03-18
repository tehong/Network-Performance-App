/**
 * created by ehong 02/25/2016
 */
'use strict';

var COMMENT_BOX_HEIGHT = 266;
// This assumes there is a dataSource and listView from teh caller
function prepareCommentBox(listView, dataSource, item, rowHight, includePriorCommentBox, forced = false) {
  if (!listView || !dataSource) {
    console.log("no listView");
    return;
  }
  // listView.getScrollResponder().scrollTo(0, 0);
  // first find the commment box
  var numOnCommentBoxBefore = 0;
  for (var i=0; i<dataSource.getRowCount(); i++) {
    var data = dataSource.getRowData(0,i);
    if (data.kpi === item.kpi && data.category === item.category && data.dailyAverage === item.dailyAverage && data.name === item.name) {
      // scroll to the right comment box
      // data due to reload dataSounce flags are often out of sync with the item
      if (data.isCommonOn !== item.isCommentOn) {
        data.isCommentOn = item.isCommentOn;
      }
      if (data.isCommentOn || forced) {
        if (listView.getScrollResponder()) {
          var y = rowHight*(i+1)+numOnCommentBoxBefore*COMMENT_BOX_HEIGHT - 10;
          listView.getScrollResponder().scrollTo({x:0, y: y, animated: false});
          console.log("prepareCommentBox scroll to = ", y);
        } else {
          console.log("ERR - no scroll responder!");
          return;  // something is wrong
        }
      }
      break;
    }
    if (includePriorCommentBox && data.isCommentOn) {
      numOnCommentBoxBefore++;
    }
  }
  // adds a inset when there is a at lease one comment box open
  var addInset = false;
  for (var i=0; i<dataSource.getRowCount(); i++) {
    var data = dataSource.getRowData(0,i);
    if (data.isCommentOn) {
      addInset = true;
      break;
    }
  }
  var newInset = addInset ? 400 : 0;
  if (newInset === 0) {
    return global.contentInset;
  }
  return {bottom: newInset};
}

module.exports = prepareCommentBox;
