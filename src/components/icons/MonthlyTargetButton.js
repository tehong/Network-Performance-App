'use strict';

var React = require('react-native');
var {
  StyleSheet,
  // TouchableHighlight,
  View,
  Image,
} = React;

var MonthlyNavTitle = require('./areas/MonthlyNavTitle');
var ForwardButton = require('./ForwardButton');
var MonthlyTargetScreen = require('../../MonthlyTargetScreen');

var BackButton = React.createClass({

  goToMonthly: function() {
    this.props.resetToRoute({
      titleComponent: PerfNavTitle,
      rightCorner: ForwardButton,
      component: MonthlyTargetScreen,
      headerStyle: styles.header,
      passProps: {
        entityType: 'monthly',
      }
    });
  },
  render() {
    return (
      <TouchableOpacity underlayColor="transparent" onPress={this.goToMonthly}>
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
  },
  header: {
    // backgroundColor: "#1C75BC",
    backgroundColor: "#066D7E",
  },
});


module.exports = BackButton;
