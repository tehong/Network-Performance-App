var React = require('react-native');

var {
  Alert,
  AlertIOS,
  Text,
  TextInput,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet
} = React;

var Parse = require('parse/react-native');
var Intercom = require('react-native-intercom');
var mixpanelTrack = require('./components/mixpanelTrack');
var SectorScreen = require('./SectorScreen');
var BackButton = require('./components/icons/BackButton');
var main = require('./main');
var LogoRight = require('./components/icons/LogoRight');
var PerfNavTitle = require('./components/icons/areas/PerfNavTitle');


module.exports = React.createClass({
  getInitialState: function() {
    return {
      appID: global.appID,
      appKey: global.appKey,
      currentUser: null,
    }
  },
  componentWillMount: function() {
    Parse.User.currentAsync()
    .then((user) => {this.setState({currentUser: user});});
  },
  componentDidMount: function() {
    this.mpUserProfile();
  },
  saveAppKeysToStorage: function() {
    global.storage.save({
      key: global.CONTROL_KEYS_STORAGE_TOKEN,
      rawData: {
          controlUsername: this.state.appID,
          controlPassword: this.state.appKey
      },
      // if not specified, the defaultExpires will be applied instead.
      // if set to null, then it will never expires.
      expires: null,
    });
    Alert.alert(
      'Change App Details',
      'Application ID and Application Key have been changed.',
    );
    global.appID = this.state.appID;
    global.appKey = this.state.appKey;
  },
  saveAppKeys: function() {
    var valid = true;
    if (this.state.appID.length !== 10) {
      Alert.alert(
        'Incorrect Application ID Entry!',
        'It should be 10 characters, your entry is ' + this.state.appID.length,
      );
      valid = false;
    }
    if (this.state.appKey.length !== 10) {
      Alert.alert(
        'Incorrect Applicaiton Key Entry!',
        'It should be 10 characters, your entry is ' + this.state.appKey.length,
      );
      valid = false;
    }
    if (valid) {
      AlertIOS.alert(
        'Changing App Details',
        'Press \"Change\" to confirm changing the App ID and Key!\nWARNING: Incorrect values will prevent you from running this app.',
        [
          {text: 'Cancel'},
          {text: 'Change', onPress: (text) => this.saveAppKeysToStorage()},
        ],
      );
    }
  },
  onPressAppDetails: function() {
    this.saveAppKeys();
  },
  removeLoginStorage: function() {
    global.storage.remove({
      key: global.LOGIN_STORAGE_TOKEN,   // Note: Do not use underscore("_") in key!
    });
  },
  logout: function() {
    Parse.User.logOut();
    // IMPORTANT:  Need to load the LoginScreen on a lazy loading,
    //   can't load the LoginScreen in the beginning since LoginScreen loads other first
    this.removeLoginStorage()  // remove the login storage so no login info is saved
    var LoginScreen = require('./LoginScreen')
    this.props.resetToRoute({
      component: LoginScreen,
      hideNavigationBar: true,
    });
/*
    this.props.toRoute({
      titleComponent: PerfNavTitle,
      backButtonComponent: BackButton,
      rightCorner: LogoRight,
      component: LoginScreen,
      headerStyle: styles.header,
      hideNavigationBar: true,
      passProps: {
        clearLogin: true,
      }
    });
    */
  },
  onPressLogout: function() {
    AlertIOS.alert(
      'Sign Out of Beeper',
      'Press \"OK\" to confirm signing out of this app.',
      [
        {text: 'Cancel'},
        {text: 'OK', onPress: (text) => this.logout()},
      ],
    );
  },
  mpUserProfile: function() {
    mixpanelTrack("User Profile", null, this.state.currentUser);
  },
  render: function() {
    var user = this.state.currentUser;
    var TouchableElement = TouchableOpacity;  // for iOS or Android variation
    var name = user.get('firstName') + " " + user.get('lastName');
        <View style={styles.detailContainer}>
        </View>
    return (
      <View style={styles.container}>
        <View style={styles.headingContainer}>
          <Image style={styles.profileImage} source={require('./assets/images/Profile_Icon_Large.png')}/>
          <Text style={styles.nameHeading}>{name}</Text>
          <Text style={styles.emailHeading}>{user.get("email")}</Text>
        </View>
        <View style={styles.spacer}/>
        <ScrollView style={styles.scrollViewContainer}>
          <View style={styles.contentContainer}>
            <View style={styles.loginDetailsContainer}>
              <Text style={styles.textDetailsHeader}>Login Details</Text>
              <View style={styles.loginDetailsTextContainer}>
                <View style={styles.textBox1}>
                  <Text style={styles.text1}>Username</Text>
                  <Text style={styles.text2}>{user.get("username")}</Text>
                </View>
                <View style={styles.textBox2}>
                  <Text style={styles.text1}>Password</Text>
                  <Text style={styles.text2}>**********</Text>
                </View>
                <TouchableElement
                  style={styles.button}
                  onPress={this.onPressLogout}
                  underlayColor={"#105D95"}>
                  <Text style={styles.appButtonText}>Sign Out of Beeper</Text>
                </TouchableElement>
              </View>
            </View>
            <View style={styles.personalDetailsContainer}>
              <Text style={styles.textDetailsHeader}>Personal Details</Text>
              <View style={styles.personalDetailsTextContainer}>
                <View style={styles.textBox1}>
                  <Text style={styles.text1}>First Name</Text>
                  <Text style={styles.text2}>{user.get('firstName')}</Text>
                </View>
                <View style={styles.textBox2}>
                  <Text style={styles.text1}>Last Name</Text>
                  <Text style={styles.text2}>{user.get('lastName')}</Text>
                </View>
                <View style={styles.textBox2}>
                  <Text style={styles.text1}>Job Title</Text>
                  <Text style={styles.text2}>{user.get("title")}</Text>
                </View>
                <View style={styles.textBox2}>
                  <Text style={styles.text1}>Phone Number</Text>
                  <Text style={styles.text2}>{user.get("phone")}</Text>
                </View>
                <View style={styles.textBox2}>
                  <Text style={styles.text1}>Email Address</Text>
                  <Text style={styles.text2}>{user.get("email")}</Text>
                </View>
              </View>
            </View>
            <View style={styles.officeDetailsContainer}>
              <Text style={styles.textDetailsHeader}>Office Details</Text>
              <View style={styles.officeDetailsTextContainer}>
                <View style={styles.textBox1}>
                  <Text style={styles.text1}>Address</Text>
                  <Text style={styles.text3}>{user.get("officeAddress")}</Text>
                </View>
              </View>
            </View>
            <View style={styles.appDetailsContainer}>
              <Text style={styles.textDetailsHeader}>App Details</Text>
              <View style={styles.appDetailsTextContainer}>
                <View style={styles.textBox1}>
                  <Text style={styles.text1}>Application ID</Text>
                  <TextInput style={styles.textInput}
                    onChangeText={(text) => this.setState({appID: text})}
                    value={this.state.appID}
                    autoCorrect={false}
                    autoCapitalize={'none'}
                  />
                </View>
                <View style={styles.textBox2}>
                  <Text style={styles.text1}>Application Key</Text>
                  <TextInput style={styles.textInput}
                    onChangeText={(text) => this.setState({appKey: text})}
                    value={this.state.appKey}
                    autoCorrect={false}
                    autoCapitalize={'none'}
                  />
                </View>
                <TouchableElement
                  style={styles.button}
                  onPress={this.onPressAppDetails}
                  underlayColor={"#105D95"}>
                  <Text style={styles.appButtonText}>Change App ID and App Key</Text>
                </TouchableElement>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
});

var styles = StyleSheet.create({
	container: {
    flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'stretch',
    // borderColor: "black",
    // borderWidth: 2,
	},
	headingContainer: {
    height: 125,
    flexDirection: "column",
		justifyContent: 'center',
    alignSelf: 'center',
    marginTop: -3,
    marginBottom: 5,
		alignItems: 'center',
    // borderColor: "blue",
    // borderWidth: 2,
	},
	profileImage: {
    flex: 11,
    height: 80,
    width: 85,
    // borderColor: "red",
    // borderWidth: 1,
  },
	nameHeading: {
    flex: 3,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Helvetica Neue',
    fontWeight: "600",
    color: "#1faae1",
    paddingTop: 3,
    // borderColor: "green",
    // borderWidth: 1,
  },
	emailHeading: {
    flex: 2,
    textAlign: 'center',
    fontSize: 9,
    fontFamily: 'Helvetica Neue',
    fontWeight: "500",
    color: "#505050",
    // borderColor: "green",
    // borderWidth: 1,
  },
	spacer: {
    height: 0,
    backgroundColor: "#bee2f3",
    borderColor: "#bee2f3",
    borderWidth: 1,
  },
	scrollViewContainer: {
    height: 542,  // NOTE: scrollview needs height restriction but not over the size of the device
    // flexDirection: "column",
		// justifyContent: 'flex-start',
		//alignItems: 'stretch',
    // borderColor: "red",
    // borderWidth: 2,
	},
	contentContainer: {
    flexDirection: "column",
		justifyContent: 'flex-start',
		alignItems: 'stretch',
    marginLeft: 30,
    marginRight: 30,
    paddingTop: 15,
    // borderColor: "red",
    // borderWidth: 2,
	},
	loginDetailsContainer: {
    height: 169,
    flexDirection: "column",
		justifyContent: 'flex-start',
		alignItems: 'stretch',
    marginBottom: 15,
    // borderColor: "pink",
    // whiteborderWidth: 2,
	},
  textDetailsHeader: {
    alignSelf: 'flex-start',
    textAlign: 'left',
    height: 32,
    width: 165,
    color: 'white',
    backgroundColor: '#1faae1',
    // backgroundColor: '#9e9fa2',
    fontSize: 13,
    fontFamily: 'Helvetica Neue',
    fontWeight: "400",
    paddingLeft: 10,
    paddingTop: 6,
    marginLeft: 10,
  },
  loginDetailsTextContainer: {
    alignSelf: 'stretch',
    flexDirection: "column",
		justifyContent: 'center',
		alignItems: 'stretch',
    marginTop: -9,
    marginBottom: 10,
    paddingBottom: 5,
    borderColor: "#1faae1",
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  textBox1: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 9,
    marginLeft: 9,
    marginRight: 9,
    // borderColor: "red",
    // borderWidth: 1,
  },
  textBox2: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginLeft: 9,
    marginRight: 9,
    // borderColor: "blue",
    // borderWidth: 1,
  },
  text1: {
    height: 15,
    color: "#b9babd",
    paddingLeft: 10,
    marginTop: 5,
    fontSize: 12,
    fontFamily: 'Helvetica Neue',
    fontWeight: "400",
  },
  text2: {
    height: 30,
    // height: 40,
    backgroundColor: "#f1f1f2",
    color: "#616264",
    paddingTop: 6,
    paddingLeft: 10,
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    fontWeight: "400",
    borderColor: "#f0f0f0",
    borderWidth: 1,
  },
  textInput: {
    height: 30,
    // height: 40,
    backgroundColor: "#b9babd",
    color: "white",
    paddingLeft: 10,
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    fontWeight: "400",
    borderColor: "#f0f0f0",
    borderWidth: 1,
  },
  text3: {
    // height: 40,
    backgroundColor: "#f1f1f2",
    color: "#616264",
    paddingTop: 6,
    paddingLeft: 10,
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    fontWeight: "400",
    borderColor: "#f0f0f0",
    borderWidth: 1,
  },
	personalDetailsContainer: {
    height: 293,
    flexDirection: "column",
		justifyContent: 'flex-start',
		alignItems: 'stretch',
    marginBottom: 15,
    // borderColor: "violet",
    // borderWidth: 2,
	},
  personalDetailsTextContainer: {
    alignSelf: 'stretch',
    flexDirection: "column",
		justifyContent: 'center',
		alignItems: 'stretch',
    marginTop: -9,
    marginBottom: 10,
    paddingBottom: 5,
    borderColor: "#1faae1",
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
	officeDetailsContainer: {
    height: 107,
    flexDirection: "column",
		justifyContent: 'flex-start',
		alignItems: 'stretch',
    marginBottom: 15,
    // borderColor: "red",
    // borderWidth: 2,
	},
  officeDetailsTextContainer: {
    alignSelf: 'stretch',
    flexDirection: "column",
		justifyContent: 'center',
		alignItems: 'stretch',
    marginTop: -9,
    marginBottom: 10,
    paddingBottom: 5,
    borderColor: "#1faae1",
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  appDetailsContainer: {
    height: 400,
    flexDirection: "column",
		justifyContent: 'flex-start',
		alignItems: 'stretch',
    // borderColor: "purple",
    // borderWidth: 2,
	},
  appDetailsTextContainer: {
    alignSelf: 'stretch',
    flexDirection: "column",
		justifyContent: 'center',
		alignItems: 'stretch',
    marginTop: -9,
    marginBottom: 10,
    paddingBottom: 7,
    borderColor: "#1faae1",
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  button: {
    alignSelf: 'center',
    flexDirection: "column",
		justifyContent: 'center',
		alignItems: 'stretch',
    marginTop: 10,
    // borderColor: 'red',
    // borderWidth: 2,
  },
  appButtonText: {
    width: 250,
    height: 30,
    alignSelf: 'stretch',
    textAlign: 'center',
    paddingTop: 6,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: 'Helvetica Neue',
    backgroundColor: '#1faae1',
    color: 'white',
  },
  header: {
    // backgroundColor: "#1C75BC",
    backgroundColor: "#066D7E",
  },
});
