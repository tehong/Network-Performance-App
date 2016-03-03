/**
 * created by ehong 02/25/2016
 */
'use strict';

var COMMENT_BOX_HEIGHT = 317;
// This assumes there is a dataSource and listView from teh caller
function prepareCommentBox(listView, dataSource, item, showComment, rowHight, includePriorCommentBox) {
  if (!listView || !dataSource) {
    console.log("no listView");
    return;
  }
  // listView.getScrollResponder().scrollTo(0, 0);
  // first find the commment box
  var numOnCommentBoxBefore = 0;
  for (var i=0; i<dataSource.getRowCount(); i++) {
    var data = dataSource.getRowData(0,i);
    if (!data.isCommentOn) {
      data.isCommentOn = false;
    }
    // if (data.kpi === item.kpi && data.category === item.category && data.dailyAverage === item.dailyAverage && data.name === item.name) {
    if (data === item) {  // due to data refresh, this is no longer the case
      // scroll to the right comment box
      // console.log("found item = " + item);
      // if (showComment) {
      if (data.isCommentOn) {
        var y = rowHight*(i+1)+numOnCommentBoxBefore*COMMENT_BOX_HEIGHT - 10;
        if (listView.getScrollResponder()) {
          console.log("scroll to = ", y);
          listView.getScrollResponder().scrollTo(y, 0);
        } else {
          console.log("ERR - no scroll responder!");
          return;  // something is wrong
        }
      }
      console.log("numOnCommentBoxBefore = " + numOnCommentBoxBefore);
      break;
    }
    if (includePriorCommentBox && data.isCommentOn) {
      numOnCommentBoxBefore++;
    }
  }
  // adds a inset when there is a at lease one comment box open
  var newInset = numOnCommentBoxBefore > 0 ? 250 : 0;
  if (newInset === 0) {
    return undefined;
  }
  return {bottom: newInset};
}

module.exports = prepareCommentBox;
