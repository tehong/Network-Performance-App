/**
* Sample React Native App
* https://github.com/facebook/react-native
*/
'use strict';

var React = require('react-native');
var Moment = require('moment');
var Parse = require('parse/react-native');
var Intercom = require('react-native-intercom');
var Mixpanel = require('react-native').NativeModules.RNMixpanel;
var DEFAULT_LOGIN_BUTTON_TEXT= "LOGIN";
var DEFAULT_USERNAME= "USERNAME";
var DEFAULT_PASSWORD= "PASSWORD";
var APP_ID_TITLE = 'Application ID';
var APP_KEY_TITLE = 'Application Key';


var {
  AppStateIOS,
  StyleSheet,
  Text,
  Platform,
  TextInput,
  LinkingIOS,
  View,
  Image,
  TouchableOpacity,
  Alert,
  AlertIOS,
  ActivityIndicatorIOS,
} = React;

import Storage from 'react-native-storage';
var AreaScreen = require('./AreaScreen');
var PerfNavTitle = require('./components/icons/areas/PerfNavTitle');
var Login = require('./components/icons/Login');
// var BackButton = require('./components/icons/BackButton');
var Orientation = require('react-native-orientation');
var mixpanelTrack = require('./components/mixpanelTrack');
var ParseInitIOS = require('react-native').NativeModules.ParseInit;
var PARSE_MASTER_APP_ID = 'B9NTwqpe0pua2VK3uKRleQvztdVXbpiQNvPyOJej';
var PARSE_MASTER_JS_KEY = 'qj6CwwnGTQzSchNuaSUOaGQLNYpNZHkkhypo6hnq';

var LoginScreen = React.createClass({

  // run by one time when a component is created
  getInitialState: function() {
    Orientation.lockToPortrait(); //this will lock the view to Portrait
    return {
      currentAppState: AppStateIOS.currentState,
      memoryWarnings: 0,
      isUpdatePassword: false,
      username: '',
      password: '',
      usernameDefault: DEFAULT_USERNAME,
      passwordDefault: DEFAULT_PASSWORD,
      loginButtonLabel: DEFAULT_LOGIN_BUTTON_TEXT,
      isLoading: false,
    }
  },
  componentWillMount: function() {
    this.loadControlKeysFromStorage();
  },
  componentDidMount: function() {
    // set up handlers for state changes
    AppStateIOS.addEventListener('change', this._handleAppStateChange);
    AppStateIOS.addEventListener('memoryWarning', this._handleMemoryWarning);
    Intercom.reset();
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
  resetLoginPrompt: function() {
    this.setState({
      username: '',
      password: '',
      usernameDefault: DEFAULT_USERNAME,
      passwordDefault: DEFAULT_PASSWORD,
      loginButtonLabel: DEFAULT_LOGIN_BUTTON_TEXT,
    });
  },
  saveAppKeys: function() {
    var valid = true;
    if (this.state.username.length !== global.CONTROL_KEY_LENGTH) {
      Alert.alert(
        'Incorrect Application ID Entry!',
        'It should be ' + global.CONTROL_KEY_LENGTH + ' characters, your entry is ' + this.state.username.length,
      );
      valid = false;
    }
    if (this.state.password.length !== global.CONTROL_KEY_LENGTH) {
      Alert.alert(
        'Incorrect Applicaiton Key Entry!',
        'It should be ' + global.CONTROL_KEY_LENGTH + ' characters, your entry is ' + this.state.password.length,
      );
      valid = false;
    }
    if (valid) {
      var masterUsername = this.state.username;
      var masterPassword = this.state.password;
      this.initParseApp(masterUsername, masterPassword, false, true);
    }
  },
  // this function log in to the Beeper - Master Control and get the actual Parse AppId and JsKey
  initParseApp: function(controlUsername, controlPassword, isLoadLoginFromStorage, isEnteringAppKeys) {
      // hook into the parse master control App
      Parse.initialize(PARSE_MASTER_APP_ID, PARSE_MASTER_JS_KEY);
      // login with the control Username and Password entered by the user
      Parse.User.logIn(controlUsername, controlPassword, {
        success: (user) => {
          if (isEnteringAppKeys) {
            this.setState({
              controlUsername: this.state.username,
              controlPassword: this.state.password,
            });
            // now get into the master control Parse App to get the actual Parse App ID and Key
            // somehow that username and password running on the device couldn't be blanked
            //  so we prempted set it to blank
            this.state.username = '';
            this.state.password = '';
            this.saveControlKeysToStorage();
            Alert.alert(
              'App Details',
              'Application ID and Application Key are saved.',
              [
                {text: 'OK', onPress: (text) => this.resetLoginPrompt()},
              ],
            );
          }
          var mixpanelToken = user.get("MixpanelToken");
          Mixpanel.sharedInstanceWithToken(mixpanelToken);
          this.mpAppActive();
          // get the Parse App ID and JS Key
          this.setState({
            appID: user.get('ParseAppId'),
            appKey: user.get('ParseJsKey'),
            mobileKey: user.get('ParseMobileKey')
          });
          Parse.User.logOut();
          // register on the JS side for parse login
          Parse.initialize(this.state.appID, this.state.appKey);
          // Need to register on the iOS side for push notification
          ParseInitIOS.init(this.state.appID, this.state.mobileKey);
          if (isLoadLoginFromStorage) {
            // get login from storate
            this.loadLoginFromStorage();
          }
        },
        error: (user, error) => {
          if (error.code === 100) {
            Alert.alert(
              'Error!',
              'Unable to connect to server, please check your Internet connection.',
            );
            if (isEnteringAppKeys) {
              this.setState({
                username: controlUsername,
                password: controlPassword,
                usernameDefault: APP_ID_TITLE,
                passwordDefault: APP_KEY_TITLE,
                loginButtonLabel: 'Save APP ID & Key',
              });
            } else {
              this.setState({
                username: global.appID,
                password: global.appKey,
                usernameDefault: APP_ID_TITLE,
                passwordDefault: APP_KEY_TITLE,
                loginButtonLabel: 'Save APP ID & Key',
              });
            }
          } else {
            Alert.alert(
              'Error!',
              'App ID and App Key verification failure, please re-enter them.',
            );
            this.setState({
              username: controlUsername,
              password: controlPassword,
              usernameDefault: APP_ID_TITLE,
              passwordDefault: APP_KEY_TITLE,
              loginButtonLabel: 'Save APP ID & Key',
            });
          }
        }
      });
  },
  loadLoginFromStorage: function() {
    // only load login if not in update password or entering appKeys
    if (!this.state.isUpdatePassword && this.state.appID && this.state.appKey) {
      global.storage.load({
        key: global.LOGIN_STORAGE_TOKEN,   // Note: Do not use underscore("_") in key!
        // autoSync(default true) means if data not found or expired,
        // then invoke the corresponding sync method
        autoSync: true,
        // syncInBackground(default true) means if data expired,
        // return the outdated data first while invoke the sync method.
        // It can be set to false to always return data provided by sync method when expired.(Of course it's slower)
        syncInBackground: true
      }).then( ret => {
        // found data goes to then()
        if (this.props.clearLogin) {
          this.setState({
              username: "",
              password: "",
              usernameStored: ret.username,
              passwordStored: ret.password,
          });
        } else {
          this.setState({
              username: ret.username,
              password: ret.password,
              usernameStored: ret.username,
              passwordStored: ret.password,
          });
        }
      }).catch( err => {
        // any exception including data not found
        // goes to catch()
      });
    }
  },
  saveLoginToStorage: function() {
    global.storage.save({
      key: global.LOGIN_STORAGE_TOKEN,   // Note: Do not use underscore("_") in key!
      rawData: {
        username: this.state.username,
        password: this.state.password
      },

      // if not specified, the defaultExpires will be applied instead.
      // if set to null, then it will never expires.
      // set to 24 hours
      expires: 1000 * 3600 * 24,
    });
    this.setState({
      usernameStored: this.state.username,
      passwordStored: this.state.password,
    });
  },
  saveControlKeysToStorage: function() {
    global.storage.save({
      key: global.CONTROL_KEYS_STORAGE_TOKEN,   // Note: Do not use underscore("_") in key!
      rawData: {
          controlUsername: this.state.controlUsername,
          controlPassword: this.state.controlPassword
      },
      // if not specified, the defaultExpires will be applied instead.
      // if set to null, then it will never expires.
      expires: null,
    });
    global.appID = this.state.controlUsername;
    global.appKey = this.state.controlPassword;
  },
  loadControlKeysFromStorage: function() {
    global.storage.load({
      key: global.CONTROL_KEYS_STORAGE_TOKEN,
      // autoSync(default true) means if data not found or expired,
      // then invoke the corresponding sync method
      autoSync: true,
      // syncInBackground(default true) means if data expired,
      // return the outdated data first while invoke the sync method.
      // It can be set to false to always return data provided by sync method when expired.(Of course it's slower)
      syncInBackground: true
    }).then( ret => {
      // found data goes to then()
      // sanity check
      if (ret.controlUsername.length === global.CONTROL_KEY_LENGTH && ret.controlPassword.length === global.CONTROL_KEY_LENGTH) {
        this.setState({
          controlUsername: ret.controlUsername,
          controlPassword: ret.controlPassword,
        });
        global.appID = this.state.controlUsername;
        global.appKey = this.state.controlPassword;
        this.initParseApp(ret.controlUsername, ret.controlPassword, true, false);
      }
    }).catch( err => {
      // any exception including data not found
      // goes to catch()
      this.setState({
        username: '',
        password: '',
        usernameDefault: APP_ID_TITLE,
        passwordDefault: APP_KEY_TITLE,
        loginButtonLabel: 'Save APP ID & Key',
      });
    });
  },
  render: function() {
    if (this.state.appID && this.state.appKey) {
      // Parse.initialize(this.state.appID, this.state.appKey);
      var securePasswordEntry = true;
    } else {
      var securePasswordEntry = false;
    }
    var TouchableElement = TouchableOpacity;  // for iOS or Android variation
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
      // <Image style={styles.backgroundImage} source={require('./assets/images/BG_Login.png')}>
      <Image style={styles.backgroundImage} source={require('./assets/images/BG_Login_Alpha.png')}>
        <View style={styles.container}>
          <TouchableElement
            style={styles.logoContainer}
            activeOpacity={0.5}
            onPress={this.onPressLogo}>
            {content}
          </TouchableElement>
          <View style={styles.loginContainer}>
            <TextInput style={styles.loginText}
              onChangeText={(text) => this.setState({username: text})}
              value={this.state.username}
              placeholder={this.state.usernameDefault}
              placeholderTextColor='#7AA5AD'
              secureTextEntry={this.state.isUpdatePassword}
              autoCorrect={false}
              autoCapitalize={'none'}
              editable={!this.state.isLoading}
            />
            <TextInput style={styles.loginText}
              onChangeText={(text) => this.setState({password: text})}
              value={this.state.password}
              placeholder={this.state.passwordDefault}
              placeholderTextColor='#7AA5AD'
              secureTextEntry={securePasswordEntry}
              editable={!this.state.isLoading}
            />
          </View>
          <View style={styles.loginButtonContainer}>
            <TouchableElement
              style={styles.button}
              onPress={this.onPressLogin}
              underlayColor={"#105D95"}>
              <Text style={styles.loginButtonText}>{this.state.loginButtonLabel}</Text>
            </TouchableElement>
          </View>
          <Text style={styles.forgot} onPress={this.onPressForgotten}>
            Forgotten Username or Password
          </Text>
        </View>
      </Image>
    );
  },
  onPressLogo: function() {
    Alert.alert(
      'App Info',
      'Version: ' + global.BeeperVersion + '\n\n' + global.CustomerReleaseNotes,
    );
  },
  forgotten: function(name) {
    Intercom.reset();
    Intercom.registerIdentifiedUser({userId: name})
    .then(() => {
      return Intercom.updateUser({
        name: name,
      });
    })
    .catch((err) => {
      console.log('registerIdentifiedUser ERROR - ' + name, err);
    });
    // this.mpForgotten(name);
    Intercom.displayMessageComposer();
  },
  onPressForgotten: function() {
    if (this.state.usernameStored && this.state.passwordStored) {
      this.forgotten(this.state.usernameStored);
    } else {
      AlertIOS.prompt(
        'Enter Your Full Name',
        'Please enter your full name to get support',
        [
          {'text': 'Enter', onPress: (name) => this.forgotten(name)},
          'text'
        ]
      );
    }
  },
  toDataScreen: function() {
    var username = this.state.usernameStored;
    var password = this.state.passwordStored?this.state.passwordStored:'';
    this.setState({
      isLoading: false,
      isUpdatePassword: false,
      username: username,
      password: password,
      loginButtonLabel: DEFAULT_LOGIN_BUTTON_TEXT,
    });
    if (Platform.OS === 'ios') {
      this.mpAppLogin();
      // need lazy loading to get the global.currentUser
      var LogoRight = require('./components/icons/LogoRight');
      this.props.resetToRoute({
        titleComponent: PerfNavTitle,
        rightCorner: LogoRight,
        component: AreaScreen,
        headerStyle: styles.header,
        hideNavigationBar: false,
        passProps: {
          currentUser: this.state.currentUser,
        }
      });
    } else {  // for android, no op for now
      dismissKeyboard();
    }
  },
  loginUser: function(user) {
    // check if password needs to be updated
    global.currentUser = user;
    if (this.state.loginButtonLabel === DEFAULT_LOGIN_BUTTON_TEXT && user.get("isUpdatePassword")) {
      this.setState({
        isLoading: false,
        isUpdatePassword: true,
        username: '',
        password: '',
        usernameDefault: 'Enter New Password',
        passwordDefault: 'Confirm New Password',
        loginButtonLabel: 'Save New Password',
        currentUser: user,
      });
    } else {
      this.setState({currentUser: user});
      this.saveLoginToStorage();
      this.toDataScreen();
    }
  },
  onPressLogin: function() {
    if (!this.state.appID || !this.state.appKey) {
      this.saveAppKeys();
      return;
    }
    // async storage in ioS so need to use currentAsync()
    var user = this.state.currentUser;
    if (user) {
        if (this.state.isUpdatePassword) {
          // we are using the username and password fields for new password setup and confirmation
          var password1 = this.state.username;
          var password2 = this.state.password;
          if (password1 !== password2) {
            Alert.alert(
              'Password Error!',
              'Passwords do not match!',
            );
            return;
          } else if (password1.length < 6) {
            Alert.alert(
              'Password Error!',
              'Passwords should have at least 6 alphanumeric characters!',
            );
            return;
          }
          // set user's password in memory
          var updateSuccess = false;
          user.set("password", password1);
          user.set("isUpdatePassword", false);
          // Save to Parse
          user.save(null, {
            success: (user) => {
              var username = user.get('username');
              // Saved successfully.
              /*
              AlertIOS.alert(
                'Success!',
                'Your password is updated successfuly, please log in with the new password.',
                [
                  {text: 'OK', onPress: (text) => this.resetLoginPrompt()},
                ],
              );
              */
              this.setState({
                isLoading: false,
                isUpdatePassword: false,
                username: username,
                password: '',
                loginButtonLabel: DEFAULT_LOGIN_BUTTON_TEXT,
                usernameDefault: DEFAULT_USERNAME,
                passwordDefault: DEFAULT_PASSWORD,
                currentUser: 'undefined',
              });
              Alert.alert(
                'Success!',
                'Your password is updated successfuly, please log in with the new password.',
              );
              Parse.User.logOut();
            },
            error: (user, error) => {
              // The save failed.
              // error is a Parse.Error with an error "code" and error "message".
              Alert.alert(
                'Password Save Error!',
                error.message,
              );
              Parse.User.logOut();
            },
          });
          return;
        }
        Parse.User.logOut();
        this.setState({currentUser: 'undefined'});
    }
    Parse.User.logOut();
    Intercom.reset()  // reset again
    // Log the user in
    this.setState({isLoading: true});
    Parse.User.logIn(this.state.username, this.state.password, {
      success: (user) => {
        // query the user info using current user.get
        var email=user.get("email");
        var name=user.get('firstName') + ' ' + user.get('lastName');
        var username = this.state.username.replace('@', '-');
        // var username = this.state.username;
        Intercom.registerIdentifiedUser({ userId: username })
        .then(() => {
          return Intercom.updateUser({
            name: name,
            email: email,
          });
        })
        .catch((err) => {
          console.log('registerIdentifiedUser ERROR', err);
        });
        this.loginUser(user);
      },
      error: (user, error) => {
        if (error.code === 100) {
          this.setState({isLoading: false});
          Alert.alert(
            'Error!',
            'Unable to connect to server, please check your Internet connection.',
          );
        } else {
          this.setState({isLoading: false});
          debugger;
          Alert.alert(
            'Login Error',
            error.message,
          );
        }
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
  mpAppActive: function() {
    if (this.state.currentUser) {
      mixpanelTrack("App Active", {"App Version": this.props.appVersion}, this.state.currentUser);
    } else {
      mixpanelTrack("App Launch", {"App Version": this.props.appVersion}, null);
    }
  },
  mpForgotten: function(name) {
    mixpanelTrack("Forgotten username/password", {"App Version": this.props.appVersion}, name);
  },
  mpAppLogin: function() {
    mixpanelTrack("App Login", {"App Version": this.props.appVersion}, this.state.currentUser);
    ParseInitIOS.clearBadge();
  },
  mpAppInactive: function() {
    mixpanelTrack("App Inactive", {"App Version": this.props.appVersion}, this.state.currentUser);
    this.saveLoginToStorage();
  },
  mpAppMemoryWarning: function() {
    mixpanelTrack("App Memory Warning", {"App Version": this.props.appVersion}, this.state.currentUser);
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
    paddingLeft: 20,
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
