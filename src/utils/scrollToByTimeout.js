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
          // first we need scroll up all the way to make sure that everything is reset
          //   (this is especially for site/sector using SGListView that unmount listview cells)
          // this.refs.listview.getScrollResponder().scrollTo(0, 0);
          console.log("refValidation=", refValidation);
          scrollToEntity(_this, navCommentProps, rowHeight);
          _this.clearInterval(interval);
        } else if (refValidation > 100) {
          console.log("refValidation stopped at =", refValidation);
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
