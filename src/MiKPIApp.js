/**
* 3Ten8 Mi-KPI react native app
* https://github.com/facebook/react-native
* https://github.com/3TEN8/MI-KPIApp.git
*/
'use strict';

var React = require('react-native');
var Router = require('./Router');
var {
  AppRegistry,
  // Navigator,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  Image,
} = React;

var LoginScreen = require('./LoginScreen');

/*
var NavigationBarRouteMapper = {

  LeftButton: function(route, navigator, index, navState) {
    if (index === 0) {
      return null;
    }

    var previousRoute = navState.routeStack[index - 1];
    return (
      <TouchableOpacity
        onPress={() => navigator.pop()}
        style={styles.navBarLeftButton}>
        <Image source={{uri: 'BTN_Back', isStatic: true}} />
      </TouchableOpacity>
    );
  },

  RightButton: function(route, navigator, index, navState) {
    if (index === 0) {
      return null;
    }
    return (
      <Image source={{uri: 'Logo_ATT', isStatic: true}} />
    );
  },

  Title: function(route, navigator, index, navState) {
    return (
      <Text style={[styles.navBarText, styles.navBarTitleText]}>
        {route.title} [{index}]
      </Text>
    );
  },

};
*/

var firstRoute = {
  name: 'Login',
  component: LoginScreen
};

var MiKPI = React.createClass({
  render: function() {
    return (
      <Router
        firstRoute={firstRoute}
        headerStyle={styles.header}
      />

    /*
      <Navigator
        initialRoute={{name: 'LoginScreen', index: 0}}
        renderScene={(route, navigator) =>
          <LoginScreen
            name={route.name}
            onForward={() => {
              var nextIndex = route.index + 1;
              navigator.push({
                name: 'Scene ' + nextIndex,
                index: nextIndex,
                message: 'Login',
              });
            }}
            onBack={() => {
              if (route.index > 0) {
                navigator.pop();
              }
            }}
          />
        }
      />
    */
    /*
    navigationBar={
          <Navigator.NavigationBar
            routeMapper={NavigationBarRouteMapper}
            style={styles.navBar}
          />
        }
        */
    /*
        style={styles.container}
        initialRoute={{
          title: 'Login',
          component: LoginScreen,
        }}
        tintColor='white'
        navigationBarHidden={false}
        translucent={false}
        barTintColor='#08426A'
        titleTextColor='white'
      />
      */
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#08426A",
  },
  header: {
    // flex: 1,
    // backgroundColor: "#08426A",
    backgroundColor: "#005A76",
    // backgroundColor: 'rgba(0, 0, 0, 0)',
    // backgroundColor: 'transparent',

  },
});

AppRegistry.registerComponent('MiKPI', () => MiKPI);

module.exports = MiKPI;
