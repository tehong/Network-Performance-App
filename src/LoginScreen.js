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
var CARRIER_NAME= 'Carrier Name';
var SECURITY_KEY= 'Security Key';

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
  // Alert,
  // AlertIOS,
  ActivityIndicatorIOS,
} = React;

var Actions = require('react-native-router-flux').Actions;
import Storage from 'react-native-storage';
// var AfterLoginScreen = require('./AfterLoginScreen');
var PerfNavTitle = require('./components/icons/areas/PerfNavTitle');
var Login = require('./components/icons/Login');
// var BackButton = require('./components/icons/BackButton');
var Orientation = require('react-native-orientation');
var mixpanelTrack = require('./utils/mixpanelTrack');
var ParseInitIOS = require('react-native').NativeModules.ParseInit;
var PARSE_MASTER_APP_ID = 'B9NTwqpe0pua2VK3uKRleQvztdVXbpiQNvPyOJej';
var PARSE_MASTER_JS_KEY = 'qj6CwwnGTQzSchNuaSUOaGQLNYpNZHkkhypo6hnq';

var LoginScreen = React.createClass({

  // run by one time when a component is created
  getInitialState: function() {
    return {
      memoryWarnings: 0,
      isUpdatePassword: false,
      isGettingAppKeys: true,
      username: '',
      password: '',
      usernameDefault: DEFAULT_USERNAME,
      passwordDefault: DEFAULT_PASSWORD,
      loginButtonLabel: DEFAULT_LOGIN_BUTTON_TEXT,
      isLoading: false,
      securePasswordEntry: false,
    }
  },
  componentWillMount: function() {
    this.loadControlKeysFromStorage();
    Orientation.lockToPortrait(); //this will lock the view to Portrait
  },
  componentWillUnmount: function() {
  },
  componentDidMount: function() {
    // set up handlers for state changes

    Intercom.reset();
  },
  resetLoginPrompt: function() {
    this.setState({
      username: '',
      password: '',
      usernameDefault: DEFAULT_USERNAME,
      passwordDefault: DEFAULT_PASSWORD,
      loginButtonLabel: DEFAULT_LOGIN_BUTTON_TEXT,
      securePasswordEntry: true,
    });
  },
  saveAppKeys: function() {
    var valid = true;
    if (this.state.password.length < global.CONTROL_KEY_LENGTH) {
      Actions.beeperInputScreen(
        {
          outputText: "Error:\n" + 'Incorrect Security Key Entry!',
          cancelText: 'Back to Security Key Screen',
        }
      );
      /*
      Alert.alert(
        'Error',
        'Incorrect Security Key Entry!',
      );
      */
      valid = false;
    }
    if (valid) {
      var masterUsername = this.state.username.toLowerCase();
      var masterPassword = this.state.password.toLowerCase();
      this.initParseApp(masterUsername, masterPassword, false, true);
    }
  },
  getRestService: function(user) {
    var query = new Parse.Query("RestService");
    query.equalTo("application", user);
    query.find({
      success: function(results) {
        global.restService = {};
        for (var i = 0; i < results.length; i++) {
          var serviceObj = results[i];
          switch(serviceObj.get('entityType')) {
            case 'network_perf':
              global.restService.networkPerfUrl = serviceObj.get('protocol') + "://" + serviceObj.get('hostName') + serviceObj.get('serviceUrl');
              break;
            case 'monthly_target':
              global.restService.monthlyTargetUrl = serviceObj.get('protocol') + "://" + serviceObj.get('hostName') + serviceObj.get('serviceUrl');
              break;
            case 'site_perf':
              global.restService.sitePerfUrl = serviceObj.get('protocol') + "://" + serviceObj.get('hostName') + serviceObj.get('serviceUrl');
              break;
            case 'sector_perf':
              global.restService.sectorPerfUrl = serviceObj.get('protocol') + "://" + serviceObj.get('hostName') + serviceObj.get('serviceUrl');
              break;
            case 'sector_color':
              global.restService.sectorColorUrl = serviceObj.get('protocol') + "://" + serviceObj.get('hostName') + serviceObj.get('serviceUrl');
              break;
            case 'sector_detail':
              global.restService.sectorDetailUrl = serviceObj.get('protocol') + "://" + serviceObj.get('hostName') + serviceObj.get('serviceUrl');
              break;
            case 'sector_location':
              global.restService.sectorLocationUrl = serviceObj.get('protocol') + "://" + serviceObj.get('hostName') + serviceObj.get('serviceUrl');
              break;
          }
        }
      },
      error: function(error) {
        console.log('get REST service failure with error code: ' + error.message);
      }
    });
  },
  // this function log in to the Beeper - Master Control and get the actual Parse AppId and JsKey
  initParseApp: function(controlUsername, controlPassword, isLoadLoginFromStorage, isEnteringAppKeys) {
      // hook into the parse master control App
      Parse.initialize(PARSE_MASTER_APP_ID, PARSE_MASTER_JS_KEY);
      Parse.User.logOut();
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
            Actions.beeperInputScreen(
              {
                outputText: 'App Details:\n' + 'Carrier identity is saved on your device.',
                inputButtonLabel: 'OK',
                onPressEnter: this.resetLoginPrompt,
              }
            );
            /*
            Alert.alert(
              'App Details',
              'Carrier identity is saved on your device.',
              [
                {text: 'OK', onPress: (text) => this.resetLoginPrompt()},
              ],
            );
            */
          }
          this.getRestService(user);
          // get the Parse App ID and JS Key and save it right away
          this.setState({
            appID: user.get('ParseAppId'),
            appKey: user.get('ParseJsKey'),
            mobileKey: user.get('ParseMobileKey'),
            isGettingAppKeys: false,
          });
          // Put mixpanel init last just before logging out since the mixpanel timing might affect appID/appKey saving
          var mixpanelToken = user.get("MixpanelToken");
          Mixpanel.sharedInstanceWithToken(mixpanelToken);
          Parse.User.logOut();
          // register on the JS side for parse login
          Parse.initialize(this.state.appID, this.state.appKey);
          // Need to register on the iOS side for push notification
          // ParseInitIOS.init(this.state.appID, this.state.mobileKey);
          if (isLoadLoginFromStorage) {
            // get login from storate
            this.loadLoginFromStorage();
          }
        },
        error: (user, error) => {
          if (error.code === 100) {
            Actions.beeperInputScreen(
              {
                outputText: "Error:\n" + 'Unable to connect to server, please check your Internet connection.',
                cancelText: 'Back to Login Screen',
              }
            );
            /*
            Alert.alert(
              'Error!',
              'Unable to connect to server, please check your Internet connection.',
            );
            */
            if (isEnteringAppKeys) {
              this.setState({
                username: controlUsername,
                password: controlPassword,
                usernameDefault: CARRIER_NAME,
                passwordDefault: SECURITY_KEY,
                loginButtonLabel: 'Go',
              });
            } else {
              this.setState({
                username: global.appID,
                password: global.appKey,
                usernameDefault: CARRIER_NAME,
                passwordDefault: SECURITY_KEY,
                loginButtonLabel: 'Go',
              });
            }
          } else {
            Actions.beeperInputScreen(
              {
                outputText: "Error:\n" + 'Carrier identity verification failure, please re-enter them.',
                cancelText: 'Back to Login Screen',
              }
            );
            /*
            Alert.alert(
              'Error!',
              'Carrier identity verification failure, please re-enter them.',
            );
            */
            this.setState({
              username: controlUsername,
              password: controlPassword,
              usernameDefault: CARRIER_NAME,
              passwordDefault: SECURITY_KEY,
              loginButtonLabel: 'Go',
            });
          }
        }
      });
  },
  loadLoginFromStorage: function() {
    // only load login if not in update password or entering appKeys
    if (!this.state.isUpdatePassword && this.state.appID && this.state.appKey) {
      this.setState({
          securePasswordEntry: true,
      });
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
              securePasswordEntry: true,
          });
        } else {
          this.setState({
              username: ret.username,
              password: ret.password,
              usernameStored: ret.username,
              passwordStored: ret.password,
              securePasswordEntry: true,
          });
          // log in the user directly by pressing the login button for the user
          this.onPressLogin();
        }
      }).catch( err => {
        this.setState({
          securePasswordEntry: true,
        });
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
          controlUsername: this.state.controlUsername.toLowerCase(),
          controlPassword: this.state.controlPassword.toLowerCase(),
      },
      // if not specified, the defaultExpires will be applied instead.
      // if set to null, then it will never expires.
      expires: null,
    });
    global.appID = this.state.controlUsername;
    global.appKey = this.state.controlPassword;
  },
  loadControlKeysFromStorage: function() {
    // start the activity indicator
    this.setState({isLoading: true});
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
      if (ret.controlPassword.length >= global.CONTROL_KEY_LENGTH) {
        this.setState({
          controlUsername: ret.controlUsername,
          controlPassword: ret.controlPassword,
        });
        global.appID = this.state.controlUsername;
        global.appKey = this.state.controlPassword;
        this.initParseApp(ret.controlUsername, ret.controlPassword, true, false);
      }
      // stop the activity indicator
      this.setState({
        isLoading: false,
        isGettingAppKeys: false,
      });
    }).catch( err => {
      // any exception including data not found
      // goes to catch()
      this.setState({
        username: '',
        password: '',
        usernameDefault: CARRIER_NAME,
        passwordDefault: SECURITY_KEY,
        loginButtonLabel: 'Go',
        isLoading: false,
        isGettingAppKeys: true,
      });
    });
  },
  render: function() {
    var TouchableElement = TouchableOpacity;  // for iOS or Android variation

    var forgottenLogin = this.state.isGettingAppKeys ?
          <Text style={styles.forgot}></Text>
          :
          <Text style={styles.forgot} onPress={this.onPressForgotten}>
            Forgotten Username or Password
          </Text>;

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
      // <Image style={styles.backgroundImage} source={require('./assets/images/BG_Login_Alpha.png')}>
      <Image style={styles.backgroundImage} source={require('./assets/images/BG_Login.png')}>
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
              secureTextEntry={this.state.securePasswordEntry}
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
          {forgottenLogin}
        </View>
      </Image>
    );
  },
  onPressLogo: function() {
    Actions.beeperInputScreen(
      {
        outputText: "App Info:\n" + 'Version - ' + global.BeeperVersion,
        cancelText: 'Back to Login Screen',
      }
    );
    /*
    Alert.alert(
      'App Info',
      'Version: ' + global.BeeperVersion,
    );
    */
  },
  forgotten: function(email) {
    if (email!== "") {
      Parse.Cloud.run("resetUserPassword", {email: email}, {
        success: function(message){
            // The user was saved correctly
          Actions.beeperInputScreen(
            {
              outputText: "Success:\n" + message,
              cancelText: 'Back to Login Screen',
            }
          );
          /*
          Alert.alert(
            'Success',
            message,
          );
          */
        },
        error: function(error){
          Actions.beeperInputScreen(
            {
              outputText: "Error:\n" + error.message,
              cancelText: 'Back to Login Screen',
            }
          );
          /*
          Alert.alert(
            'Error',
            error.message,
          );
          */
        }
      });
    } else {
      Actions.beeperInputScreen(
        {
          outputText: 'Error:\nNo email entered.',
          cancelText: 'Back to Login Screen',
        }
      );

      /*
      Alert.alert(
        'Error!',
        'No email entered!',
      );
      */
    }
  },
  onPressForgotten: function() {
    Actions.beeperInputScreen(
      {
        outputText: 'Enter your email to retrieve your username and reset your password:',
        inputDefault: 'John@yourcompanyname.com',
        inputButtonLabel: 'Enter',
        onPressEnter: this.forgotten,
        cancelText: 'Back to Login Screen',
      }
    );
    /*
    AlertIOS.prompt(
      'Enter Your Email',
      'Please enter your email to retrieve your username and reset your password',
      [
        {'text': 'Enter', onPress: (email) => this.forgotten(email)},
        'text'
      ]
    );
    */
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
    // save this route reset to use with loging out
    // global.resetToRoute = this.props.resetToRoute;
    if (Platform.OS === 'ios') {
      this.mpAppLogin();
      Actions.tabbar();
      /*
      // need lazy loading to get the global.currentUser
      var LogoRight = require('./components/icons/LogoRight');
      this.props.resetToRoute({
        // titleComponent: PerfNavTitle,
        // rightCorner: LogoRight,
        component: AfterLoginScreen,
        // headerStyle: styles.header,
        // hideNavigationBar: true,
        hideNavigationBar: true,
        trans: true,
        passProps: {
        }
      });
      */
    } else {  // for android, no op for now
      dismissKeyboard();
    }
  },
  loginUser: function(user) {
    // check if password needs to be updated
    global.currentUser = user;
    // IMPORTANT: need to identify mixpanel user before letting Parse register for push notification!
    this.mpUserIdentify(user);
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
      // TODO:  remove the currentUser, now in global.currentUser
      // query the user info using current user.get
      var email=user.get("email");
      var name=user.get('firstName') + ' ' + user.get('lastName');
      var username = this.state.username.replace('@', '-');
      // var username = this.state.username;
      Intercom.registerIdentifiedUser({ userId: username })
      .then(() => {
        // Need to register Parse on the iOS side for push notification
        ParseInitIOS.init(this.state.appID, this.state.mobileKey, user.id);
        // No need to register for push again from Intercom since Parse register the device already above
        //   or else there will be duplicated notifications if register twice
        // Intercom.registerForPush();
        return Intercom.updateUser({
          name: name,
          email: email,
        });
      })
      .catch((err) => {
        console.log('registerIdentifiedUser ERROR', err);
      });
      this.setState(
        {
          currentUser: user,
          securePasswordEntry: false,
        });
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
            Actions.beeperInputScreen(
              {
                outputText: "Password Error:\n" + "Passwords do not match!",
                cancelText: 'Back to Login Screen',
              }
            );
            /*
            Alert.alert(
              'Password Error!',
              'Passwords do not match!',
            );
            */
            return;
          } else if (password1.length < 6) {
            Actions.beeperInputScreen(
              {
                outputText: "Password Error:\n" + "Passwords should have at least 6 alphanumeric characters!",
                cancelText: 'Back to Login Screen',
              }
            );
            /*
            Alert.alert(
              'Password Error!',
              'Passwords should have at least 6 alphanumeric characters!',
            );
            */
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
              Actions.beeperInputScreen(
                {
                  outputText: "Success:\n" + "Your password is updated successfuly, please log in with the new password.",
                  cancelText: 'Back to Login Screen',
                }
              );
              /*
              Alert.alert(
                'Success!',
                'Your password is updated successfuly, please log in with the new password.',
              );
              */
              Parse.User.logOut();
            },
            error: (user, error) => {
              // The save failed.
              // error is a Parse.Error with an error "code" and error "message".
              Actions.beeperInputScreen(
                {
                  outputText: "Password Save Error:\n" + error.message,
                  cancelText: 'Back to Login Screen',
                }
              );
              /*
              Alert.alert(
                'Password Save Error!',
                error.message,
              );
              */
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
        this.loginUser(user);
      },
      error: (user, error) => {
        if (error.code === 100) {
          this.setState({isLoading: false});
          Actions.beeperInputScreen(
            {
              outputText: "Error:\n" + "Unable to connect to server, please check your Internet connection.",
              cancelText: 'Back to Login Screen',
            }
          );
          /*
          Alert.alert(
            'Error!',
            'Unable to connect to server, please check your Internet connection.',
          );
          */
        } else {
          this.setState({isLoading: false});
          Actions.beeperInputScreen(
            {
              outputText: "Login Error:\n" + error.message,
              cancelText: 'Back to Login Screen',
            }
          );
          /*
          Alert.alert(
            'Login Error',
            error.message,
          );
          */
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
  mpUserIdentify: function(user) {
    Mixpanel.identify(user.get('username'));
    Mixpanel.peopleSet(
      {
        "$first_name": user.get('firstName'),
        "$last_name": user.get('lastName'),
        "$email": user.get('email'),
        "$phone": user.get('phone'),
        "$created": user.get('createdAt')
      }
    );
  },
  mpForgotten: function(name) {
    mixpanelTrack("Forgotten username/password", null, name);
  },
  mpAppLogin: function() {
    mixpanelTrack("App Login", null, this.state.currentUser);
  },
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
    fontSize: 12,
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
