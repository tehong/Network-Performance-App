var React = require('react-native');

var {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} = React;

var Actions = require('react-native-router-flux').Actions;
var TimerMixin = require('react-timer-mixin');


var {
  height: deviceHeight
} = Dimensions.get('window');

module.exports = React.createClass({
  mixins: [TimerMixin],

  getInitialState: function() {
    return {
      offset: new Animated.Value(deviceHeight/100),
    }
  },
  componentWillMount: function() {
  },
  componentDidMount: function() {
    Animated.timing(this.state.offset, {
        duration: 0,
        toValue: 0
    }).start();
    global.isRefreshBadgeCount = true;
    this.closeModal();
  },
  closeModal: function() {
    var interval = this.setInterval(
      () => {
        // wait for the reducer to signal this scene is completed
        if (global.isRefreshBadgeCount === false) {
          this.clearInterval(interval);
          Actions.dismiss();
        }
      },
      1, // checking every 1 ms
    );
  },
  render: function() {
    return (
      <Animated.View style={[styles.container, {transform: [{translateY: this.state.offset}]}]}>
      </Animated.View>
    );
  }
});

// var StyleSheet = require('react-native-debug-stylesheet');

var styles = StyleSheet.create({
	container: {
    flex: 1,
    position: 'absolute',
    top:0,
    bottom:0,
    left:0,
    right:0,
    backgroundColor: 'transparent',
	},
});
