'use strict';

var React = require('react-native');
var {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} = React;

var PerfNavTitle = require('./areas/PerfNavTitle');
var BackButton = require('./BackButton');
var LogoRight = require('./LogoRight');
var AreaScreen = require('../../AreaScreen');

var ForwardButton = React.createClass({

  goToNext: function() {
    this.props.toRoute({
      titleComponent: PerfNavTitle,
      backButtonComponent: BackButton,
      rightCorner: LogoRight,
      component: AreaScreen,
      headerStyle: styles.header,
      passProps: {
        entityType: 'network',
        /*
        category: area.category,
        kpi: area.kpi,
        areaName: area.name,
        */
      }
    });
  },
  render() {
    return (
      <TouchableOpacity underlayColor="transparent" onPress={this.goToNext}>
      <View style={styles.container}>
        <Image style={styles.icon} underlayColor="transparent" source={require("../../assets/icons/BTN_Forward.png")} />
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
  header: {
    // backgroundColor: "#1C75BC",
    backgroundColor: "#066D7E",
  },
  icon: {
    width: 20,
    height: 20,
  }
});

module.exports = ForwardButton;
