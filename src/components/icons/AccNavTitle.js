// 'use strict';

var React = require('react-native');
var Moment = require('moment');
var getNavBarStyles = require('./getNavBarStyles');

var {
  View,
  Text,
  StyleSheet,
} = React;

var AccNavTitle = React.createClass({
  render() {
    var styles = getNavBarStyles();
    return (
        // <Image underlayColor="transparent" source={{uri: 'Logo_ATT', isStatic: true}} />
        <View style={styles.container}>
          <Text style={styles.title}>Accessibility </Text>
          <Text style={styles.icon}>{Moment().format("YYYY-MM-DD")}</Text>
        </View>
    );
  }
});

module.exports = AccNavTitle;