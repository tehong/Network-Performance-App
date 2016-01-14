// 'use strict';

var React = require('react-native');
var Moment = require('moment');
var getNavBarStyles = require('../../../styles/getNavBarStyles');

var {
  View,
  Text,
  StyleSheet,
} = React;

var UltNavTitle = React.createClass({
  render() {
    var styles = getNavBarStyles();
    return (
        // <Image underlayColor="transparent" source={{uri: 'Logo_ATT', isStatic: true}} />
        <View style={styles.container}>
          <Text style={styles.title}>Zone UL Throughput </Text>
          <Text style={styles.icon}>{Moment().subtract(1, 'days').format("MM/DD/YYYY")}</Text>
        </View>
    );
  }
});

module.exports = UltNavTitle;
