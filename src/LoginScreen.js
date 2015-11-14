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
} = React;

var MarketScreen = require('./MarketScreen');
var PerfNavTitle = require('./components/icons/PerfNavTitle');
var Login = require('./components/icons/Login');
var LogoATT = require('./components/icons/LogoATT');

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
          <Image style={styles.backgroundImage} source={{uri: 'BG_Blue_Gradient', isStatic: true}}>
            <View style={styles.container}>
              <View style={styles.logoContainer}>
                <Image style={styles.logo} source={{uri: 'Logo_Mi_KPI', isStatic: true}}/>
                <View style={styles.logoSpacing}>
                </View>
              </View>
              <View style={styles.loginContainer}>
                <TextInput style={styles.loginText}
                  onChangeText={(login) => this.setState({login})}
                  value={this.state.login}
                  placeholder=' USERNAME'
                  placeholderTextColor='grey'
                />
              <TextInput style={styles.loginText}
                  onChangeText={(password) => this.setState({password})}
                  value={this.state.password}
                  placeholder=' PASSWORD'
                  placeholderTextColor='grey'
                  secureTextEntry={true}
                />
              </View>
              <View style={styles.loginButtonContainer}>
                <TouchableElement
                  style={styles.button}
                  onPress={this.onPressRegister}>
                  <Text style={styles.loginButtonText}>REGISTER</Text>
                </TouchableElement>
                <TouchableElement
                  style={styles.button}
                  onPress={this.onPressLogin}>
                  <Text style={styles.loginButtonText}>LOGIN</Text>
                </TouchableElement>
            </View>
              <View style={styles.forgotContainer}>
                <View style={styles.forgotSpacing}>
                </View>
                <Text style={styles.forgot} onPress={() => LinkingIOS.openURL('http://www.3ten8.com')}>
                  FORGOTTEN PASSWORD
                </Text>
              </View>
            </View>
          </Image>
    );
  },
  onPressLogin: function() {
    /*
        leftButtonIcon: require('image!BTN_Back'),
        rightButtonIcon: require('image!Logo_ATT_BG'),
        onLeftButtonPress: () => this.props.navigator.pop(),
        */
    if (Platform.OS === 'ios') {
      this.props.toRoute({
        titleComponent: PerfNavTitle,
        leftCorner: Login,
        rightCorner: LogoATT,
        component: MarketScreen,
        headerStyle: styles.header,
      });
      /*
      this.props.navigator.push({
        renderScene: {(route, navigator) =>
          <MarketScreen
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
  },
  container: {
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 300,
    width: 280,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    // borderWidth: 2,
    // borderColor: '#00BBF0',
  },
  logoContainer: {
    flex: 3,
    alignItems: 'center',
    padding: 2,
    // borderWidth: 2,
    // borderColor: '#0000CC',
  },
  logo: {
    flex: 4,
    width: 120,
    paddingTop: 15,
    //borderWidth: 2,
    // borderColor: '#00DDFF',
    // backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  logoSpacing: {
    flex: 1,
    // borderWidth: 2,
    // borderColor: '#CCDD00',
  },
  loginContainer: {
    flex: 3,
    width: 240,
    // borderWidth: 2,
    // borderColor: '#00DD00',
  },
  loginText: {
    flex: 1,
    alignItems: 'stretch',
    marginTop: 5,
    padding: 2,
    backgroundColor: '#105D95',
    color: 'white',
    borderRadius: 1,
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#769EC0',
  },
  loginButtonContainer: {
    alignItems: 'center',
    flex: 2,
    flexDirection: "row",
    // borderWidth: 2,
    // borderColor: '#FF00CC',
  },
  loginButtonSpacing: {
    flex: 0,
    // borderWidth: 2,
    // borderColor: '#FFCC00',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    color: '#ffffff',
    // marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 3,
    width: 100,
    marginRight: 10,
    marginTop: 20,
  },
  loginButtonText: {
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: 'white',
    color: '#105D95',
  },
  forgotContainer: {
    flex: 3,
    alignItems: 'center',
    // borderWidth: 2,
    // borderColor: '#CC00CC',
  },
  forgotSpacing: {
    flex: 4,
    // borderWidth: 2,
    // borderColor: '#CCFFCC',
  },
  forgot: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    textDecorationLine: 'underline',
    fontSize: 11,
    fontWeight: "500",
  },
  navBar: {
    backgroundColor: 'white',
  },
  navBarText: {
    fontSize: 16,
    marginVertical: 10,
  },
  navBarTitleText: {
    color: "#08426A",
    fontWeight: '500',
    marginVertical: 9,
  },
  navBarLeftButton: {
    paddingLeft: 10,
  },
  navBarRightButton: {
    paddingRight: 10,
  },
  navBarButtonText: {
    color: "#08426A",
  },
  scene: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#EAEAEA',
  },
  header: {
    backgroundColor: "#1C75BC",
  },
});
// AppRegistry.registerComponent('LoginScreen', () => LoginScreen);

module.exports = LoginScreen;
