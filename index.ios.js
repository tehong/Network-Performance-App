/**
* 3Ten8 Mi-KPI react native app
* https://github.com/facebook/react-native
* https://github.com/3TEN8/RN-iOS-Beeper.git
*/
'use strict';

var React = require('react-native');
var { AppRegistry } = React;

var Main = require('./src/main');

AppRegistry.registerComponent('Beeper', () => Main);
