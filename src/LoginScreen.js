/**
* Sample React Native App
* https://github.com/facebook/react-native
*/
'use strict';

var React = require('react-native');
var Mixpanel = require('react-native').NativeModules.RNMixpanel;
var Moment = require('moment');
var MP_TOKEN = '4024c26ca43386d763c0c38a21a5cb99';


var {
  AppStateIOS,
  StyleSheet,
  Text,
  Platform,
  TextInput,
  LinkingIOS,
  View,
  Image,
  TouchableHighlight,
  AlertIOS,
} = React;

var AreaScreen = require('./AreaScreen');
var PerfNavTitle = require('./components/icons/areas/PerfNavTitle');
var Login = require('./components/icons/Login');
var LogoATT = require('./components/icons/LogoATT');
var BackButton = require('./components/icons/BackButton');

var LoginScreen = React.createClass({

  // run by one time when a component is created
  getInitialState: function() {
    Mixpanel.sharedInstanceWithToken(MP_TOKEN);
    this.mpAppLaunch();
    return {
      currentAppState: AppStateIOS.currentState,
      memoryWarnings: 0,
      login: '',
      password: '',
    }
  },
  componentDidMount: function() {
    AppStateIOS.addEventListener('change', this._handleAppStateChange);
    AppStateIOS.addEventListener('memoryWarning', this._handleMemoryWarning);
    this.mpAppActive();
  },
  componentWillUnmount: function() {
    AppStateIOS.removeEventListener('change', this._handleAppStateChange);
    AppStateIOS.removeEventListener('memoryWarning', this._handleMemoryWarning);
    this.mpAppInactive();
  },
  _handleAppStateChange: function(currentAppState) {
    // setState doesn't set the state immediately until the render runs again so this.state.currentAppState is not updated now
    this.setState({ currentAppState, });
    console.log(currentAppState);
    if (currentAppState == "active") {
      this.mpAppActive();
    } else {
      this.mpAppInactive();
    }
  },
  _handleMemoryWarning: function() {
    this.setState({memoryWarnings: this.state.memoryWarnings + 1})
    this.mpAppMemoryWarning(this.state.memoryWarnings + 1);
  },
  render: function() {
    var TouchableElement = TouchableHighlight;  // for iOS or Android variation
    // NOTE: Can't use "require()" for background image to stretch it, need to use uri mothod!
    return (
          <Image style={styles.backgroundImage} source={{uri: 'BG_Gradient_MiKPI', isStatic: true}}>
            <View style={styles.container}>
              <TouchableElement style={styles.logoContainer} underlayColor={"#119BA8"} onPress={this.onPressLogo}>
                <Image style={styles.logo} source={{uri: 'Logo_Beeper', isStatic: true}}/>
              </TouchableElement>
              <View style={styles.loginContainer}>
                <TextInput style={styles.loginText}
                  onChangeText={(login) => this.setState({login})}
                  value={this.state.login}
                  placeholder='     USERNAME'
                  placeholderTextColor='#7AA5AD'
                  autoCorrect={false}
                  autoFocus={true}
                />
                <TextInput style={styles.loginText}
                  onChangeText={(password) => this.setState({password})}
                  value={this.state.password}
                  placeholder='     PASSWORD'
                  placeholderTextColor='#7AA5AD'
                  secureTextEntry={true}
                  autoCorrect={false}
                />
              </View>
              <View style={styles.loginButtonContainer}>
                <TouchableElement
                  style={styles.button}
                  onPress={this.onPressLogin}
                  underlayColor={"#105D95"}>
                  <Text style={styles.loginButtonText}>LOGIN</Text>
                </TouchableElement>
              </View>
              <Text style={styles.forgot} onPress={() => LinkingIOS.openURL('http://www.3ten8.com')}>
                Forgotten Username or Password
              </Text>
            </View>
          </Image>
    );
  },
  onPressLogo: function() {
    AlertIOS.alert(
      'App Info',
      'Version: ' + this.props.appVersion,
    );
  },
  onPressLogin: function() {
    /*
        leftButtonIcon: require('image!BTN_Back'),
        rightButtonIcon: require('image!Logo_ATT_BG'),
        onLeftButtonPress: () => this.props.navigator.pop(),
        */
    this.setState({
      login:'',
      password:'',
    });
    if (Platform.OS === 'ios') {
      this.props.toRoute({
        titleComponent: PerfNavTitle,
        backButtonComponent: BackButton,
        rightCorner: LogoATT,
        component: AreaScreen,
        headerStyle: styles.header,
        hideNavigationBar: false,
      });
      /*
      this.props.navigator.push({
        renderScene: {(route, navigator) =>
          <AreaScreen
            name={route.name}
            onForward={() => {
              var nextIndex = route.index + 1;
              navigator.push({
                name: 'Scene ' + nextIndex,
                index: nextIndex,
                message: 'Market',
              });
            }}
            onBack={() => {
              if (route.index > 0) {
                navigator.pop();
              }
            }}
          />
        },
        navigationBar: {
          <Navigator.NavigationBar
            routeMapper={NavigationBarRouteMapper}
            style={styles.navBar}
          />
        }
      });
      */
    } else {  // for android, no op for now
      dismissKeyboard();
      this.props.navigator.push({
        // title: market.title,
        name: 'market',
        // market: market,
      });
    }
  },
  onPressRegister: function() {
    LinkingIOS.openURL('http://www.3ten8.com');
  },
  mpAppLaunch: function() {
    Mixpanel.track('App Launch', null);
  },
  mpAppActive: function() {
    Mixpanel.track('App Active', null);
  },
  mpAppInactive: function() {
    Mixpanel.track('App Inactive', null);
  },
  mpAppMemoryWarning: function() {
    Mixpanel.track(
      'App Memory Warning', null);
  }
});

var styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: '#00BBF0',
  },
  container: {
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 450,
    width: 220,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    // borderWidth: 2,
    // borderColor: '#00BBF0',
  },
  logoContainer: {
    flex: 3,
    marginBottom: 120,
    // borderWidth: 1,
    // borderColor: '#F0000F',
  },
  logo: {
    // flex: 3,
    width: 157,
    height: 124,
    // borderWidth: 1,
    // borderColor: 'red',
  },
  loginContainer: {
    flex: 3,
    width: 280,
    justifyContent: 'space-between',
    // borderWidth: 2,
    // borderColor: '#00DD00',
  },
  loginButtonContainer: {
    flex: 3,
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
    // borderColor: 'yellow',
    // borderWidth: 2,
  },
  loginText: {
    flex: 1,
    backgroundColor: '#0B858B',
    color: 'white',
    fontSize: 13,
    fontFamily: 'Helvetica Neue',
    fontWeight: "500",
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#91C6C2',
  },
  button: {
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: 280,
    height: 28,
    marginTop: 0,
    // borderColor: 'yellow',
    // borderWidth: 2,
  },
  loginButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: "500",
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'white',
    color: 'gray',
  },
  forgot: {
    flex: 3,
    marginTop: 30,
    marginBottom: 15,
    textAlign: 'center',
    color: 'white',
    textDecorationLine: 'underline',
    fontSize: 10,
    fontFamily: 'Helvetica Neue',
    fontWeight: "500",
    // borderWidth: 1,
    // borderColor: '#CC00CC',
  },
  scene: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#EAEAEA',
  },
  header: {
    // backgroundColor: "#1C75BC",
    backgroundColor: "#066D7E",
  },
});
// AppRegistry.registerComponent('LoginScreen', () => LoginScreen);

module.exports = LoginScreen;
