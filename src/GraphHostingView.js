var React = require('react-native');
var {
  View,
  requireNativeComponent,
} = React;


var GraphHostingView = React.createClass({
  render() {
    return <SparklinePlotView {...this.props} />;
  },
  propTypes: {
   /**
    * Used to style and layout the `MapView`.  See `StyleSheet.js` and
    * `ViewStylePropTypes.js` for more info.
    */
   style: View.propTypes.style,
 },

});

var SparklinePlotView = requireNativeComponent('SparklinePlotView', GraphHostingView);

module.exports = GraphHostingView;
