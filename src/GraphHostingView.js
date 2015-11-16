var React = require('react-native');
var {
  View,
  requireNativeComponent,
} = React;

var SparklineView = requireNativeComponent('SparklineView', GraphHostingView);

var GraphHostingView = React.createClass({
  render() {
    return <SparklineView {...this.props} />;
  },
  propTypes: {
   /**
    * Used to style and layout the `MapView`.  See `StyleSheet.js` and
    * `ViewStylePropTypes.js` for more info.
    */
   // plot: React.PropTypes.bool,
   redThreshold: React.PropTypes.number,
   dataArray: React.PropTypes.arrayOf(
     React.PropTypes.arrayOf(
       React.PropTypes.any, // string or integer basically
     ),
   ),
   style: View.propTypes.style,
 },

});


module.exports = GraphHostingView;
