'use strict';

var React = require('react-native');
var {
  StyleSheet,
  TouchableOpacity,
  // TouchableHighlight,
  View,
  Image,
} = React;

var Actions = require('react-native-router-flux').Actions;
var BackButton = React.createClass({
  backToPrevious: function() {
    // allows parent to override the default pop() action
    if (this.props.action) {
      this.props.action();
    } else {
      Actions.pop();
    }
  },
  render() {
    return (
      <TouchableOpacity underlayColor="transparent" onPress={this.backToPrevious}>
        <View style={styles.container}>
          <Image style={styles.icon} underlayColor="transparent" source={require("../../assets/icons/BTN_Back.png")} />
        </View>
      </TouchableOpacity>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    justifyContent: 'flex-start',
    width: 50,
    height: 42,
    // borderColor: "red",
    // borderWidth: 1,
    paddingTop: 14,
    paddingLeft: 8,
  },
  icon: {
    width: 20,
    height: 20,
  }
});


module.exports = BackButton;
