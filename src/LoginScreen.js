/**
* Sample React Native App
* https://github.com/facebook/react-native
*/
'use strict';

var React = require('react-native');
var Mixpanel = require('react-native').NativeModules.RNMixpanel;
var Moment = require('moment');
var Parse = require('parse/react-native');
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
  ActivityIndicatorIOS,
} = React;

var AreaScreen = require('./AreaScreen');
var PerfNavTitle = require('./components/icons/areas/PerfNavTitle');
var Login = require('./components/icons/Login');
var LogoRight = require('./components/icons/LogoRight');
var BackButton = require('./components/icons/BackButton');
var Orientation = require('react-native-orientation');

var LoginScreen = React.createClass({

  // run by one time when a component is created
  getInitialState: function() {
    Orientation.lockToPortrait(); //this will lock the view to Portrait
    Mixpanel.sharedInstanceWithToken(MP_TOKEN);
    this.mpAppLaunch();
    return {
      currentAppState: AppStateIOS.currentState,
      memoryWarnings: 0,
      username: '',
      password: '',
      isLoading: false,
    }
  },
  componentWillMount: function() {
  },
  componentDidMount: function() {
    // set up handlers for state changes
    AppStateIOS.addEventListener('change', this._handleAppStateChange);
    AppStateIOS.addEventListener('memoryWarning', this._handleMemoryWarning);
    // mark app active
    this.mpAppActive();
  },
  componentWillUnmount: function() {
    // remove state change handlers
    AppStateIOS.removeEventListener('change', this._handleAppStateChange);
    AppStateIOS.removeEventListener('memoryWarning', this._handleMemoryWarning);
    // mark app inactive
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
    var content = this.state.isLoading ?
    <Image style={styles.logo} source={require('./assets/images/Logo_Beeper.png')}>
      <ActivityIndicatorIOS
        animating={true}
        style={[styles.logo, {height: 200}]}
        color={"white"}
        size="large"
      />
    </Image>
    :
    <Image style={styles.logo} source={require('./assets/images/Logo_Beeper.png')}/>;

    // NOTE: Can't use "require()" for background image to stretch it, need to use uri mothod!
    return (
      <Image style={styles.backgroundImage} source={require('./assets/images/BG_Login.png')}>
        <View style={styles.container}>
          <TouchableElement style={styles.logoContainer} underlayColor={"#119BA8"} onPress={this.onPressLogo}>
            {content}
          </TouchableElement>
          <View style={styles.loginContainer}>
            <TextInput style={styles.loginText}
              onChangeText={(text) => this.setState({username: text})}
              value={this.state.username}
              placeholder='     USERNAME'
              placeholderTextColor='#7AA5AD'
              autoCorrect={false}
              autoFocus={true}
              autoCapitalize={'none'}
              editable={!this.state.isLoading}
            />
            <TextInput style={styles.loginText}
              onChangeText={(text) => this.setState({password: text})}
              value={this.state.password}
              placeholder='     PASSWORD'
              placeholderTextColor='#7AA5AD'
              secureTextEntry={true}
              editable={!this.state.isLoading}
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
    // async storage in ioS so need to use currentAsync()
    this.setState({isLoading: true});
    Parse.User.currentAsync()
    .then((user) => {Parse.User.logOut();})
    // Log the user in
    Parse.User.logIn(this.state.username, this.state.password, {
      success: (user) => {
        this.setState({password: '', isLoading: false});
        if (Platform.OS === 'ios') {
          this.props.toRoute({
            titleComponent: PerfNavTitle,
            backButtonComponent: BackButton,
            rightCorner: LogoRight,
            component: AreaScreen,
            headerStyle: styles.header,
            hideNavigationBar: false,
          });
        } else {  // for android, no op for now
          dismissKeyboard();
        }
      },
      error: (user, error) => {
        this.setState({isLoading: false});
        AlertIOS.alert(
          'Login Error',
          error.message,
        );
      }
    });

  },
  onPressRegister: function() {
    if (this.state.isLoading) {
      return;
    } else {
      LinkingIOS.openURL('http://www.3ten8.com');
    }
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
    // resizeMode: 'stretch',  // this allows the width to be stretched in "row" order
    flex: 1,  // this stretch the height to be stretched in "row" order
    justifyContent: 'center',
    alignItems: 'center',
    // height: null,  // enable full height stretch in "column" order
    width: null,  // enable full width stretch in "row" order
    // borderWidth: 2,
    // borderColor: 'yellow',
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
    marginBottom: 110,
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
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    fontWeight: "500",
    marginTop: 5,
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
    marginTop: 25,
    marginBottom: 20,
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
