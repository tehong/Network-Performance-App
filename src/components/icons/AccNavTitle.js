// 'use strict';

var React = require('react-native');
var Moment = require('moment');

var {
  View,
  Text,
  StyleSheet,
} = React;

var AccNavTitle = React.createClass({
  render() {
    return (
        // <Image underlayColor="transparent" source={{uri: 'Logo_ATT', isStatic: true}} />
        <View style={styles.container}>
          <Text style={styles.title}>Accessibility </Text>
          <Text style={styles.icon}>{Moment().format("YYYY-MM-DD")}</Text>
        </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    marginTop: 5,
    color: 'white',
    fontWeight: "500",
  },
  icon: {
    fontSize: 10,
    marginTop: 5,
    color: 'white',
  },
});

module.exports = AccNavTitle;
