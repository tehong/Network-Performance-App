/**
 * created by ehong 02/20/2016
 */
'use strict';


function scrollToByTimeout(_this, entityType, rowHeight) {
  if (global.navCommentProps && global.navCommentProps.entityType.toLowerCase() === entityType.toLowerCase()) {
    var navCommentProps = global.navCommentProps;
    global.navCommentProps = undefined;
    var refValidation = 0;
    var interval = _this.setInterval(
      () => {
        refValidation++;
        // make sure all the components are loaded, especially the listview
        if(_this.refs.listview) {
          console.log("refValidation=", refValidation);
          scrollToEntity(_this, navCommentProps, rowHeight);
          _this.clearInterval(interval);
        }
      },
      100, // trigger scrolling 500 ms later
    );
  }
}
function scrollToEntity(_this, entity, rowHeight) {
  if (entity) {
    var findScrollItem = require('./findScrollItem');
    var prepareCommentBox = require('./prepareCommentBox');
    var item = findScrollItem(_this.state.dataSource, entity);
    if (item) {
      var contentInset = prepareCommentBox(_this.refs.listview, _this.state.dataSource, item, true, rowHeight, false);
      _this.setState({
        contentInset: contentInset,
      });
    }
  }
}

module.exports = scrollToByTimeout;
