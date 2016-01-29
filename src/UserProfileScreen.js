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
  StyleSheet,
  ActivityIndicatorIOS,
} = React;

var Parse = require('parse/react-native');
var Intercom = require('react-native-intercom');
var mixpanelTrack = require('./components/mixpanelTrack');
var SectorScreen = require('./SectorScreen');
var BackButton = require('./components/icons/BackButton');
var main = require('./main');
var LogoRight = require('./components/icons/LogoRight');
var PerfNavTitle = require('./components/icons/areas/PerfNavTitle');
var UIImagePickerManager = require('NativeModules').UIImagePickerManager;


module.exports = React.createClass({
  getInitialState: function() {
    return {
      appID: global.appID,
      appKey: global.appKey,
      avatarSource: global.DEFAULT_PROFILE_IMAGE,
      isLoading: false,
    }
  },
  componentWillMount: function() {
    //Parse.User.currentAsync()
    // .then((user) => {this.setState({currentUser: user});});
    this.loadProfilePhoto();
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
      'Application ID and Application Key have been changed.  You are logged out.',
    );
    global.appID = this.state.appID;
    global.appKey = this.state.appKey;
    // log the person out
    this.logout();
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
  onPressImagePick: function() {
    var options = {
      title: 'Select Profile Image', // specify null or empty string to remove the title
      cancelButtonTitle: 'Cancel',
      takePhotoButtonTitle: 'Take Photo...', // specify null or empty string to remove this button
      chooseFromLibraryButtonTitle: 'Choose from Library...', // specify null or empty string to remove this button
      /*
      customButtons: {
        'Choose Photo from Facebook': 'fb', // [Button Text] : [String returned upon selection]
      },
      */
      cameraType: 'front', // 'front' or 'back'
      mediaType: 'photo', // 'photo' or 'video'
      videoQuality: 'low', // 'low', 'medium', or 'high'
      maxWidth: 100, // photos only
      maxHeight: 100, // photos only
      quality: 1.0, // photos only
      allowsEditing: true, // Built in iOS functionality to resize/reposition the image
      noData: false, // photos only - disables the base64 `data` field from being generated (greatly improves performance on large photos)
      storageOptions: { // if this key is provided, the image will get saved in the documents directory (rather than a temporary directory)
        skipBackup: true, // image will NOT be backed up to icloud
        path: 'images' // will save image at /Documents/images rather than the root
      }
    };
    /**
    * The first arg will be the options object for customization, the second is
    * your callback which sends bool: didCancel, object: response.
    *
    * response.didCancel will inform you if the user cancelled the process
    * response.error will contain an error message, if there is one
    * response.data is the base64 encoded image data (photos only)
    * response.uri is the uri to the local file asset on the device (photo or video)
    * response.isVertical will be true if the image is vertically oriented
    * response.width & response.height give you the image dimensions
    */

    UIImagePickerManager.showImagePicker(options, (response) => {
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('UIImagePickerManager Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        this.uploadImageToParse(response.data);
      }
    });
  },
  loadProfilePhoto: function() {
    this.setState({
      avatarSource: global.DEFAULT_PROFILE_IMAGE,
      isLoading: true,
    });
    if (global.currentUser) {
      var parseFile = global.currentUser.get('profilePhoto');
      if (parseFile) {
        var imageUrl = parseFile.url();
        if (imageUrl) {
          this.setState({
            avatarSource: {uri: imageUrl},
            isLoading: false,
          });
        }
      }
    } else {
      this.setState({
        isLoading: false,
      });
    }
  },
  uploadImageToParse: function(imageData) {
    var file = {
        base64: imageData.toString('base64'),
    };
    this.setState({
      isLoading: true,
    });
    var name = "profileImage.jpg";
    var parseFile = new Parse.File(name, file);
    var thisView = this;
    parseFile.save().then(function() {
      // The file has been saved to Parse.
      var user = global.currentUser;
      user.set('profilePhoto', parseFile);
      user.save(null, {
        success: (user) => {
          // var file = sourceImage;
          // You can display the image using either data:
          const source = {uri: 'data:image/jpeg;base64,' + imageData, isStatic: true};
          // uri (on iOS)
          //   const source = {uri: response.uri.replace('file://', ''), isStatic: true};
          // uri (on android)
          //   const source = {uri: response.uri, isStatic: true};
          thisView.setState({
            avatarSource: source,
            isLoading: false,
          });
        },
        error: (user, error) => {
          // The save failed.
          // error is a Parse.Error with an error "code" and error "message".
          thisView.setState({
            isLoading: false,
          });
          Alert.alert(
            'Photo Cloud Save Error!',
            error.message,
          );
        },
      });
    },
    function(error) {
      debugger;
      // The file either could not be read, or could not be saved to Parse.
    });
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
      trans: true,
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
    mixpanelTrack("User Profile", null, global.currentUser);
  },
  render: function() {
    var user = global.currentUser;
    var TouchableElement = TouchableOpacity;  // for iOS or Android variation
    var name = user.get('firstName') + " " + user.get('lastName');
    var boxStyle = {borderColor: '#bcbec0', borderWidth: StyleSheet.hairlineWidth};
    // var boxStyle = {borderColor: '#bcbec0', borderWidth: 1};

    var title =
      <View style={styles.headingContainer}>
        <View style={styles.profileImageBackground}>
          <TouchableElement
            style={styles.iconTouch}
            onPress={this.onPressImagePick}
            underlayColor={"#105D95"}>
            <Image style={styles.editIcon} source={require('./assets/icons/Icon_Edit.png')}/>
          </TouchableElement>
        </View>
        <Image style={styles.profileImage} source={this.state.avatarSource}/>
        <Text style={styles.nameHeading}>{name}</Text>
        <Text style={styles.emailHeading}>{user.get("email")}</Text>
      </View>;

    var loginDetails =
      <View style={styles.loginDetailsContainer}>
        <Text style={styles.textDetailsHeader}>Login Details</Text>
        <View style={[styles.loginDetailsTextContainer, boxStyle]}>
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
      </View>;

    var personalDetails =
      <View style={styles.personalDetailsContainer}>
        <Text style={styles.textDetailsHeader}>Personal Details</Text>
        <View style={[styles.personalDetailsTextContainer, boxStyle]}>
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
      </View>;

    var officeDetails =
      <View style={styles.officeDetailsContainer}>
        <Text style={styles.textDetailsHeader}>Office Details</Text>
        <View style={[styles.officeDetailsTextContainer, boxStyle]}>
          <View style={styles.textBox1}>
            <Text style={styles.text1}>Address</Text>
            <Text style={styles.text3}>{user.get("officeAddress")}</Text>
          </View>
        </View>
      </View>;

    var appDetails =
      <View style={styles.appDetailsContainer}>
        <Text style={styles.textDetailsHeader}>App Details</Text>
        <View style={[styles.appDetailsTextContainer, boxStyle]}>
          <View style={styles.textBox1}>
            <Text style={styles.text1}>Software Version</Text>
            <Text style={styles.text3}>{global.BeeperVersion}</Text>
          </View>
          <View style={styles.textBox1}>
            <Text style={styles.text1}>Application ID (edit directly)</Text>
            <TextInput style={styles.textInput}
              onChangeText={(text) => this.setState({appID: text})}
              value={this.state.appID}
              autoCorrect={false}
              autoCapitalize={'none'}
            />
          </View>
          <View style={styles.textBox2}>
            <Text style={styles.text1}>Application Key (edit directly)</Text>
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
            <Text style={styles.appButtonText}>Save New App ID and Key</Text>
          </TouchableElement>
          <View style={styles.textBox1}>
            <Text style={styles.text1}>Release Notes</Text>
            <Text style={styles.text3}>{global.CustomerReleaseNotes}</Text>
          </View>
        </View>
      </View>;

    return (
      <View style={styles.container}>
        {title}
        <View style={styles.spacer}/>
        <ScrollView style={styles.scrollViewContainer}>
          <View style={styles.contentContainer}>
            {loginDetails}
            {personalDetails}
            {officeDetails}
            {appDetails}
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
    height: 140,
    flexDirection: "column",
		justifyContent: 'center',
    alignSelf: 'stretch',
    marginTop: 0,
    marginBottom: 5,
		alignItems: 'center',
    // borderColor: "green",
    // borderWidth: 2,
	},
	profileImageBackground: {
    flex: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // resizeMode: 'stretch',
    alignSelf: 'stretch',
    height: null,
    backgroundColor: '#066D7E',
    // borderColor: "red",
    // borderWidth: 2,
	},
	iconTouch: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginLeft: 100,
    marginBottom: 20,
    height: 20,
    width: 40,
    backgroundColor: 'transparent',
    // borderColor: "red",
    // borderWidth: 1,
  },
	editIcon: {
    flex: 2,
    height: 20,
    width: 20,
    backgroundColor: "transparent",
  },
	profileImage: {
    height: 90,
    width: 90,
    marginTop: -43,
    backgroundColor: 'transparent',
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 45,
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
    marginBottom: 20,
    // borderColor: "pink",
    // whiteborderWidth: 2,
	},
  textDetailsHeader: {
    alignSelf: 'flex-start',
    textAlign: 'left',
    height: 32,
    width: 165,
    color: 'white',
    // backgroundColor: '#1faae1',
    backgroundColor: '#bcbec0',
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
    marginBottom: 7,
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
    backgroundColor: 'transparent',
  },
	officeDetailsContainer: {
    height: 107,
    flexDirection: "column",
		justifyContent: 'flex-start',
		alignItems: 'stretch',
    marginBottom: 7,
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
    backgroundColor: 'transparent',
  },
  appDetailsContainer: {
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
