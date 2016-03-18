/**
 * created by ehong 02/20/2016
 */
'use strict';


function scrollToByTimeout(_this, entityType, rowHeight, scrollOnly = false) {
  if (global.navCommentProps && global.navCommentProps.entityType.toLowerCase() === entityType.toLowerCase()) {
    var navCommentProps = global.navCommentProps;
    var refValidation = 0;
    var scrollToBottom = true;
    var interval = _this.setInterval(
      () => {
        refValidation++;
        // make sure all the components are loaded, especially the listview
        if(_this.refs.listview) {
            scrollToEntity(_this, navCommentProps, rowHeight, scrollOnly);
            _this.clearInterval(interval);
            // for site, we need to scroll to the right place first before the comment can be turned on
            //   So for scrollOnly we  don't clear the condition
            if (!scrollOnly) {
              global.navCommentProps = undefined;
            }
        } else if (refValidation > 100) {
          console.log("refValidation stopped at =", refValidation);
          _this.clearInterval(interval);
          global.navCommentProps = undefined;
        }
      },
      100, // check trigger scrolling every x ms
    );
  }
}
function scrollToEntity(_this, entity, rowHeight, forced = false) {
  if (entity) {
    var findScrollItem = require('./findScrollItem');
    var prepareCommentBox = require('./prepareCommentBox');
    var item = findScrollItem(_this.state.dataSource, entity);
    if (item) {
      var contentInset = prepareCommentBox(_this.refs.listview, _this.state.dataSource, item, rowHeight, false, forced);
      _this.setState({
        contentInset: contentInset,
      });
    }
  }
}

module.exports = scrollToByTimeout;
