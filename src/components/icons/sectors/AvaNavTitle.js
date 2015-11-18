// 'use strict';

var React = require('react-native');
var Moment = require('moment');
var getNavBarStyles = require('../../../styles/getNavBarStyles');

var {
  View,
  Text,
  StyleSheet,
} = React;

var AvaNavTitle = React.createClass({
  render() {
    var styles = getNavBarStyles();
    return (
        // <Image underlayColor="transparent" source={{uri: 'Logo_ATT', isStatic: true}} />
        <View style={styles.container}>
          <Text style={styles.title}>Sector Availability </Text>
          <Text style={styles.icon}>{Moment().format("MM/DD/YYYY")}</Text>
        </View>
    );
  }
});

module.exports = AvaNavTitle;
