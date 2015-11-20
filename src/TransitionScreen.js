/**
* 3Ten8 Mi-KPI react native app
* https://github.com/facebook/react-native
* https://github.com/3TEN8/MI-KPIApp.git
*/
'use strict';

var React = require('react-native');
var {
  Platform,
  AppRegistry,
  StyleSheet,
  Text,
} = React;

var LoginScreen = require('./LoginScreen');

var TransitionScreen = React.createClass({
  componentWillMount: function() {
    if (Platform.OS === 'ios') {
      this.props.toRoute({
        component: LoginScreen,
        // headerStyle: styles.header,
        hideNavigationBar: true,
      });
    }
  },
  render: function() {
    return <Text>User is not supposed to be here</Text>
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#066D7E",
  },
});

AppRegistry.registerComponent('TransitionScreen', () => TransitionScreen);

module.exports = TransitionScreen;
