var React = require('react-native');
var {
  View,
  requireNativeComponent,
} = React;

var SparklineView_IOS = requireNativeComponent('SparklineView', SparklineView);

var SparklineView = React.createClass({
  render() {
    return <SparklineView_IOS {...this.props} />;
  },
  propTypes: {
   /**
    * Used to style and layout the `MapView`.  See `StyleSheet.js` and
    * `ViewStylePropTypes.js` for more info.
    */
   // plot: React.PropTypes.bool,
   average: React.PropTypes.number,
   yScale: React.PropTypes.arrayOf(
      React.PropTypes.any,
    ),
   dataArray: React.PropTypes.arrayOf(
     React.PropTypes.arrayOf(
       React.PropTypes.any, // string or integer basically
     ),
   ),
   style: View.propTypes.style,
 },

});


module.exports = SparklineView;
